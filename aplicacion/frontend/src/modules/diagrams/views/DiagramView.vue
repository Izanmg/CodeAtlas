<!--
  DiagramView.vue

  Vista a pantalla completa del canvas del diagrama. Renderiza un Vue Flow
  con los seis nodos custom, los seis tipos de edge, toolbar superior,
  toolbar de filtros y leyenda flotantes, minimapa y side panel.

  Comportamientos clave:
    - Click en nodo → activa modo foco (dim de no-relacionados) y abre
      el side panel.
    - Click en lienzo o Esc → cierra panel y limpia el foco.
    - Filtros → ocultan los nodos del tipo desactivado y sus edges.
    - Drag de nodos → historial undo/redo; botón guardar en topbar.
    - Salir con cambios sin guardar → modal de confirmación.

  Notas de implementación:
    - Se usa modo controlado de VueFlow: @nodes-change + applyNodeChanges
      para mantener nodes.value sincronizado con el estado interno.
    - El MiniMap se monta después de dos requestAnimationFrame para que
      VueFlow haya medido las dimensiones de los nodos y evitar viewBox=NaN.
    - diagram.value se asigna al FINAL en onMounted para que VueFlow
      (v-if="diagram") nunca se renderice con nodes/edges vacíos.
-->
<script setup>
import { ref, computed, onMounted, onUnmounted, markRaw, nextTick } from 'vue'
import { useRoute, useRouter, onBeforeRouteLeave } from 'vue-router'
import { VueFlow, useVueFlow } from '@vue-flow/core'
import { Background } from '@vue-flow/background'
import { Controls } from '@vue-flow/controls'
import { ArrowLeft, Undo2, Redo2, Save, CheckCircle2 } from 'lucide-vue-next'

import { useDiagramsStore } from '../stores/diagrams.store'
import { useProjectsStore } from '@/modules/projects/stores/projects.store'
import { autoLayout } from '../core/auto-layout'
import { NODE_META } from '../core/node-meta'

import BackendNode  from '../components/nodes/BackendNode.vue'
import FrontendNode from '../components/nodes/FrontendNode.vue'
import ScreenNode   from '../components/nodes/ScreenNode.vue'
import DatabaseNode from '../components/nodes/DatabaseNode.vue'
import RulesNode    from '../components/nodes/RulesNode.vue'
import FloatingEdge from '../components/FloatingEdge.vue'
import CanvasToolbar      from '../components/CanvasToolbar.vue'
import CanvasLegend       from '../components/CanvasLegend.vue'
import CanvasRules        from '../components/CanvasRules.vue'
import CanvasFlowSelector from '../components/CanvasFlowSelector.vue'
import CanvasFlowPanel    from '../components/CanvasFlowPanel.vue'
import SidePanel          from '../components/SidePanel.vue'
import Modal  from '@/components/ui/Modal.vue'
import Button from '@/components/ui/Button.vue'

const route = useRoute()
const router = useRouter()
const diagramsStore = useDiagramsStore()
const projectsStore = useProjectsStore()

const diagram   = ref(null)
const project   = ref(null)
const rulesData = ref({})
const flowsData = ref([])  // model.flows tal cual lo entrega el backend

const nodes = ref([])
const edges = ref([])
const selectedId = ref(null)
const visible = ref({
  backend: true, frontend: true, screen: true,
  database: true,
})
// Las relaciones "indirectas" son las que se pintan en discontinuo
// (uses-db, navigates, backend-dep, frontend-dep). El usuario puede
// ocultarlas para reducir ruido visual.
const INDIRECT_KINDS = new Set(['uses-db', 'navigates', 'backend-dep', 'frontend-dep'])
const showIndirect = ref(true)

// Búsqueda de nodos. Dos modos:
//   - searchQuery: texto que se está escribiendo. Mientras no haya un
//     nodo concreto seleccionado del autocompletado, atenúa lo que no
//     coincide pero sigue mostrándolo (preview).
//   - selectedSearchNodeId: nodo elegido del autocompletado. Bloquea la
//     vista a ese nodo + sus vecinos directos: oculta totalmente todo
//     lo demás.
const searchQuery = ref('')
const selectedSearchNodeId = ref(null)

// Modo del canvas: 'relations' (por defecto) o 'flows'.
const mode = ref('relations')
// Flujo seleccionado en modo flujos. Auto-selecciona el primero al activar.
const activeFlowId = ref(null)

const nodeTypes = {
  backend:  markRaw(BackendNode),
  frontend: markRaw(FrontendNode),
  screen:   markRaw(ScreenNode),
  database: markRaw(DatabaseNode),
  rules:    markRaw(RulesNode),
}

const edgeTypes = {
  floating: markRaw(FloatingEdge),
}

const { fitView } = useVueFlow()

// ── Historial de posiciones (undo / redo) ────────────────────────────────
// Cada snapshot es { [vfNodeId]: { x, y } }.
const snapshots   = ref([])
const snapshotIdx = ref(-1)

const canUndo = computed(() => snapshotIdx.value > 0)
const canRedo = computed(() => snapshotIdx.value < snapshots.value.length - 1)
// Hay cambios sin guardar cuando estamos por encima del snapshot base (índice 0).
const dirty = computed(() => snapshotIdx.value > 0)

const saving = ref(false)
const saved  = ref(false)

/**
 * Captura las posiciones actuales de todos los nodos como un snapshot
 * { [nodeId]: { x, y } } para el historial de undo/redo.
 *
 * @returns {Object<string, {x: number, y: number}>} Mapa de posiciones por nodo
 */
function captureSnapshot() {
  const snap = {}
  nodes.value.forEach((n) => { snap[n.id] = { x: n.position.x, y: n.position.y } })
  return snap
}

/**
 * Apila un snapshot nuevo en el historial. Si se había deshecho, descarta los
 * snapshots "futuros" antes de añadir (se abre una rama nueva del historial).
 *
 * @param {Object<string, {x: number, y: number}>} snap - Snapshot a guardar
 */
function pushSnapshot(snap) {
  snapshots.value = snapshots.value.slice(0, snapshotIdx.value + 1)
  snapshots.value.push(snap)
  snapshotIdx.value = snapshots.value.length - 1
}

// Flag para ignorar los @nodes-change que VueFlow emite al detectar
// el cambio de posición en el prop :nodes durante un applySnapshot.
const applyingSnapshot = ref(false)

/**
 * Aplica un snapshot moviendo cada nodo a su posición guardada. Activa
 * applyingSnapshot para que handleNodesChange ignore los @nodes-change que
 * VueFlow dispara por este cambio programático.
 *
 * @param {Object<string, {x: number, y: number}>} snap - Snapshot a aplicar
 */
function applySnapshot(snap) {
  applyingSnapshot.value = true
  nodes.value = nodes.value.map((n) => ({
    ...n,
    position: snap[n.id] ?? n.position,
  }))
  nextTick(() => { applyingSnapshot.value = false })
}

/** Deshace el último movimiento de nodos (retrocede un snapshot). */
function undo() {
  if (!canUndo.value) return
  snapshotIdx.value--
  applySnapshot(snapshots.value[snapshotIdx.value])
}

/** Rehace el movimiento previamente deshecho (avanza un snapshot). */
function redo() {
  if (!canRedo.value) return
  snapshotIdx.value++
  applySnapshot(snapshots.value[snapshotIdx.value])
}

/**
 * Convierte un id de nodo de Vue Flow (con prefijo db-/mod-/scr-/flow-) al id
 * "crudo" del modelo que espera el backend. El nodo 'rules' mapea a 'system-rules'.
 *
 * @param {string} vfId - Id del nodo en Vue Flow
 * @returns {string} Id del modelo sin prefijo
 */
function vfIdToRawId(vfId) {
  if (vfId === 'rules') return 'system-rules'
  return vfId.replace(/^(db|mod|flow|scr)-/, '')
}

/**
 * Persiste las posiciones actuales de los nodos en el backend y reinicia el
 * historial dejando este estado como nuevo punto "limpio" (sin cambios sin
 * guardar). Muestra el indicador "Guardado" durante 2 segundos.
 *
 * @returns {Promise<void>}
 */
async function saveLayout() {
  saving.value = true
  try {
    const layout = {}
    nodes.value.forEach((n) => {
      layout[vfIdToRawId(n.id)] = { x: n.position.x, y: n.position.y }
    })
    await diagramsStore.saveLayout(diagram.value.id, layout)
    const snap = captureSnapshot()
    snapshots.value = [snap]
    snapshotIdx.value = 0
    saved.value = true
    setTimeout(() => { saved.value = false }, 2000)
  } finally {
    saving.value = false
  }
}

// ── Tracking de drags ────────────────────────────────────────────────────
// VueFlow emite position changes con `dragging: true` durante el arrastre
// (incluyen `position` cuando hay movimiento) y un evento final con
// `dragging: false` SIN `position` (ver core: solo añade position si
// `changed===true`). Acumulamos las últimas posiciones por id y, al
// recibir el evento final, las commiteamos a nodes.value + snapshot.
// Aplicamos las posiciones manualmente porque applyNodeChanges del core
// solo muta instancias GraphNode internas, no los objetos planos.
const pendingDragPositions = new Map()

/**
 * Handler de @nodes-change de VueFlow. Acumula las posiciones durante el
 * arrastre y, al soltar el nodo (dragging === false), commitea el movimiento a
 * nodes.value y crea un snapshot para el historial de undo/redo.
 *
 * @param {Array<object>} changes - Cambios de posición emitidos por VueFlow
 */
function handleNodesChange(changes) {
  if (applyingSnapshot.value) return

  let dragEnded = false

  for (const c of changes) {
    if (c.type !== 'position') continue
    if (c.position) {
      pendingDragPositions.set(c.id, { x: c.position.x, y: c.position.y })
    }
    if (c.dragging === false) {
      dragEnded = true
    }
  }

  if (!dragEnded || pendingDragPositions.size === 0) return

  applyingSnapshot.value = true
  const updates = new Map(pendingDragPositions)
  pendingDragPositions.clear()
  nodes.value = nodes.value.map((n) =>
    updates.has(n.id) ? { ...n, position: updates.get(n.id) } : n
  )
  pushSnapshot(captureSnapshot())
  nextTick(() => { applyingSnapshot.value = false })
}

// ── Modal "salir sin guardar" ────────────────────────────────────────────
const showLeaveModal     = ref(false)
const pendingLeaveTarget = ref(null)
const leaveSaving        = ref(false)
const forceLeave         = ref(false)

onBeforeRouteLeave((to, _from, next) => {
  if (dirty.value && !forceLeave.value) {
    pendingLeaveTarget.value = to.fullPath
    showLeaveModal.value = true
    next(false)
  } else {
    forceLeave.value = false
    next()
  }
})

/** Cierra el modal de "salir sin guardar" y se queda en la vista. */
function cancelLeave() {
  showLeaveModal.value = false
  pendingLeaveTarget.value = null
}

/** Descarta los cambios sin guardar y navega al destino que estaba pendiente. */
function leaveWithoutSaving() {
  showLeaveModal.value = false
  forceLeave.value = true
  router.push(pendingLeaveTarget.value)
}

/**
 * Guarda el layout y, si va bien, navega al destino pendiente.
 *
 * @returns {Promise<void>}
 */
async function saveAndLeave() {
  leaveSaving.value = true
  try {
    await saveLayout()
    showLeaveModal.value = false
    router.push(pendingLeaveTarget.value)
  } finally {
    leaveSaving.value = false
  }
}

// ── Carga del diagrama ───────────────────────────────────────────────────
onMounted(async () => {
  const id = route.params.id
  const d  = await diagramsStore.fetchById(id)
  if (!d) {
    router.push('/')
    return
  }
  project.value = await projectsStore.fetchById(d.projectId)

  rulesData.value = d.data.model.systemRules ?? {}
  flowsData.value = d.data.model.flows ?? []

  const built      = autoLayout(d.data)
  const allScreens = d.data.model.screens
  const flowChipsByNode = computeFlowChipsByNode(flowsData.value)

  nodes.value = built.nodes
    .filter((n) => n.type !== 'rules')   // las reglas van al panel flotante
    .map((n) => ({
      ...n,
      data: {
        ...n.data,
        flowChips: flowChipsByNode[n.id] || [],
        _onPickFlow: handlePickFlow,
        ...(n.type === 'frontend' ? { _allScreens: allScreens } : {}),
      },
    }))
  edges.value  = built.edges
  diagram.value = d   // ← al final: VueFlow no renderiza con nodos vacíos

  // Snapshot inicial (estado "limpio")
  const snap = captureSnapshot()
  snapshots.value   = [snap]
  snapshotIdx.value = 0
})

/**
 * Para cada flujo, cuenta cuántos pasos tocan cada nodo y devuelve un mapa
 * { [nodeId]: [{ flowId, flowName, stepCount }] }.
 * Solo cuenta pasos con un nodeId válido (los que llevan prefijo en el .md).
 */
function computeFlowChipsByNode(flows) {
  const map = {}
  for (const flow of flows) {
    const counts = {}
    for (const step of flow.steps || []) {
      if (!step.nodeId) continue
      counts[step.nodeId] = (counts[step.nodeId] || 0) + 1
    }
    for (const [nodeId, count] of Object.entries(counts)) {
      if (!map[nodeId]) map[nodeId] = []
      map[nodeId].push({ flowId: flow.id, flowName: flow.name, stepCount: count })
    }
  }
  return map
}

/**
 * Cambia a modo flujos y activa un flujo concreto. Lo dispara el chip de flujo
 * que se pinta dentro de cada nodo.
 *
 * @param {{flowId: string}} payload - Flujo seleccionado
 */
function handlePickFlow({ flowId }) {
  mode.value = 'flows'
  activeFlowId.value = flowId
  selectedId.value = null
}

/** Flujo actualmente activo en modo flujos (o null si está en "todos los flujos"). */
const activeFlow = computed(() =>
  flowsData.value.find((f) => f.id === activeFlowId.value) ?? null
)

// Edges amarillos para el modo flujos.
// - Sin flujo activo (`activeFlowId === null`): agrega las transiciones de
//   todos los flujos del sistema. Permite ver el grafo completo.
// - Con flujo activo: solo las transiciones de ese flujo.
// Si una misma transición se repite N veces se dibuja una sola arista con
// badge ×N.
const flowEdges = computed(() => {
  if (mode.value !== 'flows') return []
  const flows = activeFlow.value ? [activeFlow.value] : flowsData.value
  const counts = new Map()
  for (const flow of flows) {
    const steps = flow.steps || []
    for (let i = 0; i < steps.length - 1; i++) {
      const a = steps[i].nodeId
      const b = steps[i + 1].nodeId
      if (!a || !b || a === b) continue
      const key = `${a}::${b}`
      counts.set(key, (counts.get(key) || 0) + 1)
    }
  }
  const tag = activeFlowId.value || 'all'
  return Array.from(counts.entries()).map(([key, count]) => {
    const [source, target] = key.split('::')
    return {
      id: `flow-edge-${tag}-${source}-${target}`,
      source,
      target,
      type: 'floating',
      animated: true,
      label: count > 1 ? `×${count}` : undefined,
      style: {
        stroke: 'var(--kind-flow)',
        strokeWidth: 1.8,
        strokeDasharray: '5 3',
      },
      data: { kind: 'flow-edge' },
    }
  })
})

/**
 * Cambia el modo del canvas. Al entrar en 'flows' arranca mostrando todos los
 * flujos (sin uno concreto activo).
 *
 * @param {'relations'|'flows'} next - Modo destino
 */
function setMode(next) {
  mode.value = next
  if (next === 'flows') {
    // Por defecto al entrar en modo flujos: "todos los flujos".
    activeFlowId.value = null
  }
}

// ── Foco / filtros ───────────────────────────────────────────────────────
// Conjunto a destacar cuando hay un nodo seleccionado por click: él mismo más
// sus vecinos directos. Null si no hay selección.
const focusSet = computed(() => {
  if (!selectedId.value) return null
  const set = new Set([selectedId.value])
  edges.value.forEach((e) => {
    if (e.source === selectedId.value) set.add(e.target)
    if (e.target === selectedId.value) set.add(e.source)
  })
  return set
})

// Locked set: cuando hay un nodo seleccionado del autocompletado, este
// set determina qué se ve (todo lo que no esté dentro se oculta).
// Si las relaciones indirectas están ocultas, los vecinos solo se cuentan
// a través de aristas directas — un nodo conectado únicamente por una
// indirecta no aparece como vecino.
const lockedSearchSet = computed(() => {
  const id = selectedSearchNodeId.value
  if (!id) return null
  const set = new Set([id])
  edges.value.forEach((e) => {
    if (!showIndirect.value && INDIRECT_KINDS.has(e.data?.kind)) return
    if (e.source === id) set.add(e.target)
    if (e.target === id) set.add(e.source)
  })
  return set
})

// Focus set por escritura libre (solo atenúa, no oculta). Inactivo
// cuando ya hay un nodo bloqueado del autocompletado.
const searchFocusSet = computed(() => {
  if (selectedSearchNodeId.value) return null
  const q = searchQuery.value.trim().toLowerCase()
  if (!q) return null
  const matched = new Set()
  for (const n of nodes.value) {
    const name = (n.data?.name || '').toLowerCase()
    if (name.includes(q) || n.id.toLowerCase().includes(q)) {
      matched.add(n.id)
    }
  }
  if (matched.size === 0) return new Set()
  const set = new Set(matched)
  edges.value.forEach((e) => {
    if (matched.has(e.source)) set.add(e.target)
    if (matched.has(e.target)) set.add(e.source)
  })
  return set
})

// Unión de los focus sets activos (click + búsqueda). Null si ninguno.
const effectiveFocusSet = computed(() => {
  const a = focusSet.value
  const b = searchFocusSet.value
  if (!a && !b) return null
  if (!a) return b
  if (!b) return a
  return new Set([...a, ...b])
})

// Lista plana de nodos buscables para el autocompletado.
const searchableNodes = computed(() =>
  nodes.value.map((n) => ({
    id: n.id,
    name: n.data?.name || n.id,
    kind: n.data?.kind,
  }))
)

// Conjunto de nodos que participan en el flujo activo (modo flujos).
// Si no hay flujo activo (vista "todos los flujos") devolvemos null para
// señalar que no hay que atenuar nada.
const flowNodeSet = computed(() => {
  if (mode.value !== 'flows' || !activeFlow.value) return null
  const set = new Set()
  for (const step of activeFlow.value.steps || []) {
    if (step.nodeId) set.add(step.nodeId)
  }
  return set
})

// Las edges del flujo activo no entran en el atenuado: queremos que se
// vean al 100% mientras los nodos no participantes pierden opacidad.
const flowEdgeSet = computed(() => {
  if (mode.value !== 'flows' || !activeFlow.value) return null
  return new Set(flowEdges.value.map((e) => e.id))
})

const filteredNodes = computed(() =>
  nodes.value.map((n) => {
    if (mode.value === 'flows') {
      // "Todos los flujos": flowNodeSet es null → todos visibles al 100%.
      // Flujo concreto: solo los nodos que aparecen reciben rf-active.
      const inFlow = flowNodeSet.value ? flowNodeSet.value.has(n.id) : true
      return {
        ...n,
        hidden: false,
        selected: n.id === selectedId.value,
        class: inFlow ? 'rf-active' : '',
      }
    }
    const lockedHidden = lockedSearchSet.value
      ? !lockedSearchSet.value.has(n.id)
      : false
    return {
      ...n,
      hidden: lockedHidden || !visible.value[n.data.kind],
      selected: n.id === selectedId.value,
      class: effectiveFocusSet.value
        ? (effectiveFocusSet.value.has(n.id) ? 'rf-active' : '')
        : '',
    }
  })
)

const filteredEdges = computed(() => {
  if (mode.value === 'flows') {
    // Si hay flujo activo, marca sus edges como activas para que el rf-dim
    // del wrapper no las atenúe.
    return flowEdges.value.map((e) => ({
      ...e,
      class: flowEdgeSet.value ? 'rf-edge-active' : '',
    }))
  }
  return edges.value.flatMap((e) => {
    const src = nodes.value.find((n) => n.id === e.source)
    const tgt = nodes.value.find((n) => n.id === e.target)
    if (!src || !tgt) return []
    const indirect = INDIRECT_KINDS.has(e.data?.kind)
    // Las indirectas se excluyen del array por completo cuando el toggle
    // está apagado: así Vue Flow no las renderiza ni siquiera ocultas.
    if (indirect && !showIndirect.value) return []
    // Modo bloqueado: solo se muestran las aristas que tocan al nodo
    // protagonista. Las conexiones entre dos vecinos suyos se omiten.
    if (selectedSearchNodeId.value) {
      const id = selectedSearchNodeId.value
      if (e.source !== id && e.target !== id) return []
    }
    const hidden =
      !visible.value[src.data.kind] ||
      !visible.value[tgt.data.kind]
    const isActive = effectiveFocusSet.value
      ? (effectiveFocusSet.value.has(e.source) && effectiveFocusSet.value.has(e.target))
      : false
    return [{ ...e, hidden, class: isActive ? 'rf-edge-active' : '' }]
  })
})

// Nodo actualmente seleccionado (el que alimenta el side panel), o null.
const selectedNode = computed(() =>
  nodes.value.find((n) => n.id === selectedId.value) || null
)

// Recuento de nodos por tipo, para los badges de los filtros de la toolbar.
const counts = computed(() => {
  const c = { backend: 0, frontend: 0, screen: 0, database: 0, rules: 0 }
  nodes.value.forEach((n) => {
    if (c[n.data.kind] !== undefined) c[n.data.kind]++
  })
  return c
})

/**
 * Muestra u oculta todos los nodos de un tipo (filtros de la toolbar).
 *
 * @param {string} k - Tipo de nodo: backend | frontend | screen | database
 */
function toggleFilter(k) {
  visible.value = { ...visible.value, [k]: !visible.value[k] }
}

/** Selecciona un nodo al hacer click (abre el side panel y activa el foco). */
function onNodeClick({ node }) { selectedId.value = node.id }

/**
 * Doble-click en un nodo: abre la vista detallada (deep-dive) del módulo. Solo
 * aplica a módulos backend y frontend, que son los que tienen archivos dentro.
 */
function onNodeDoubleClick({ node }) {
  if (node?.data?.kind !== 'backend' && node?.data?.kind !== 'frontend') return
  const moduleId = node.id.replace(/^mod-/, '')
  router.push(`/diagrams/${diagram.value.id}/modules/${moduleId}`)
}
/** Click en el lienzo vacío: deselecciona el nodo activo. */
function onPaneClick()         { selectedId.value = null }

/** Limpia por completo el foco: quita selección y búsqueda. */
function clearFocus() {
  selectedId.value = null
  searchQuery.value = ''
  selectedSearchNodeId.value = null
}

/**
 * Actualiza el texto de búsqueda. Si el usuario edita el texto después de haber
 * fijado un nodo del autocompletado, lo deselecciona para volver al modo
 * "preview con atenuado".
 *
 * @param {string} value - Texto introducido en el buscador
 */
function onSearchChange(value) {
  searchQuery.value = value
  if (selectedSearchNodeId.value) {
    const sel = nodes.value.find((n) => n.id === selectedSearchNodeId.value)
    if (!sel || (sel.data?.name || '') !== value) {
      selectedSearchNodeId.value = null
    }
  }
}

/**
 * Fija un nodo elegido en el autocompletado: bloquea la vista a ese nodo y sus
 * vecinos directos, ocultando el resto.
 *
 * @param {string} id - Id del nodo seleccionado
 */
function onNodeSelected(id) {
  selectedSearchNodeId.value = id
  const node = nodes.value.find((n) => n.id === id)
  if (node) searchQuery.value = node.data?.name || ''
}

/**
 * Atajos de teclado del canvas: Esc deselecciona, Ctrl/Cmd+Z deshace y
 * Ctrl/Cmd+Y (o Ctrl/Cmd+Shift+Z) rehace.
 *
 * @param {KeyboardEvent} e
 */
function onKeydown(e) {
  if (e.key === 'Escape' && selectedId.value) {
    selectedId.value = null
    return
  }
  if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
    e.preventDefault()
    undo()
    return
  }
  if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
    e.preventDefault()
    redo()
  }
}

onMounted(() => window.addEventListener('keydown', onKeydown))
onUnmounted(() => window.removeEventListener('keydown', onKeydown))

/** Vuelve a la vista del proyecto (o al dashboard si no se conoce el proyecto). */
function goBack() {
  router.push(project.value ? `/projects/${project.value.id}` : '/')
}

</script>

<template>
  <!-- Modal: salir sin guardar -->
  <Modal
    :open="showLeaveModal"
    title="Cambios sin guardar"
    :width="420"
    @close="cancelLeave"
  >
    <p class="text-fg-muted m-0" style="font-size: 13.5px; line-height: 1.65;">
      Tienes cambios en las posiciones del diagrama que no se han guardado.
      ¿Deseas guardarlos antes de salir?
    </p>
    <template #footer>
      <Button variant="ghost" :disabled="leaveSaving" @click="cancelLeave">
        Cancelar
      </Button>
      <Button variant="secondary" :disabled="leaveSaving" @click="leaveWithoutSaving">
        Salir sin guardar
      </Button>
      <Button variant="primary" :disabled="leaveSaving" @click="saveAndLeave">
        <template #icon><Save :size="13" /></template>
        {{ leaveSaving ? 'Guardando…' : 'Guardar y salir' }}
      </Button>
    </template>
  </Modal>

  <div
    class="absolute inset-0 bg-bg-canvas"
    :class="(effectiveFocusSet || flowNodeSet) ? 'rf-dim' : ''"
  >
    <!-- Top bar propio del diagrama -->
    <div
      class="absolute left-0 right-0 z-[6] bg-surface flex items-center"
      :style="{
        top: 0,
        height: '48px',
        borderBottom: '1px solid var(--border)',
        padding: '0 12px',
        gap: '10px',
      }"
    >
      <button
        class="inline-flex items-center text-fg-muted hover:bg-bg-subtle hover:text-fg rounded-sm shrink-0"
        :style="{
          height: '28px',
          padding: '0 10px',
          border: '1px solid var(--border)',
          fontSize: '12px',
          fontWeight: 500,
          gap: '6px',
        }"
        title="Volver al proyecto"
        @click="goBack"
      >
        <ArrowLeft :size="13" /> Volver
      </button>

      <div
        class="flex items-center min-w-0 flex-1 font-mono text-fg-subtle"
        style="gap: 8px; font-size: 12px;"
      >
        <span class="text-fg-faint hidden sm:inline">{{ project?.name }}</span>
        <span class="text-fg-faint hidden sm:inline">/</span>
        <span class="text-fg font-medium whitespace-nowrap overflow-hidden text-ellipsis">
          {{ diagram?.name }}
        </span>
      </div>

      <!-- Controles: undo · redo · separador · guardar -->
      <div class="flex items-center shrink-0" style="gap: 4px;">
        <button
          class="inline-flex items-center justify-center rounded text-fg-muted transition-colors duration-100"
          :class="canUndo ? 'hover:bg-bg-subtle hover:text-fg' : 'opacity-30 cursor-not-allowed'"
          style="width: 28px; height: 28px;"
          :disabled="!canUndo"
          title="Deshacer (Ctrl+Z)"
          @click="undo"
        >
          <Undo2 :size="14" />
        </button>

        <button
          class="inline-flex items-center justify-center rounded text-fg-muted transition-colors duration-100"
          :class="canRedo ? 'hover:bg-bg-subtle hover:text-fg' : 'opacity-30 cursor-not-allowed'"
          style="width: 28px; height: 28px;"
          :disabled="!canRedo"
          title="Rehacer (Ctrl+Y)"
          @click="redo"
        >
          <Redo2 :size="14" />
        </button>

        <div style="width: 1px; height: 18px; background: var(--border); margin: 0 4px;" />

        <Button
          variant="primary"
          size="sm"
          :disabled="!dirty || saving"
          @click="saveLayout"
        >
          <template #icon>
            <CheckCircle2 v-if="saved && !dirty" :size="13" />
            <Save v-else :size="13" />
          </template>
          {{ saving ? 'Guardando…' : saved && !dirty ? 'Guardado' : 'Guardar' }}
        </Button>
      </div>

      <div
        class="font-mono text-fg-subtle uppercase hidden md:block shrink-0"
        style="font-size: 10.5px; letter-spacing: 0.06em;"
      >
        {{ nodes.length }} bloques · {{ edges.length }} conexiones
      </div>
    </div>

    <!-- Área del lienzo -->
    <div class="absolute left-0 right-0" :style="{ top: '48px', bottom: 0 }">
      <CanvasToolbar
        :search="searchQuery"
        :searchable-nodes="searchableNodes"
        :selected-node-id="selectedSearchNodeId"
        :visible="visible"
        :counts="counts"
        :focus-active="!!(effectiveFocusSet || lockedSearchSet)"
        :mode="mode"
        :show-indirect="showIndirect"
        @update:search="onSearchChange"
        @select-node="onNodeSelected"
        @toggle="toggleFilter"
        @fit="fitView({ padding: 0.12, duration: 400 })"
        @clear-focus="clearFocus"
        @mode="setMode"
        @toggle-indirect="showIndirect = !showIndirect"
      />

      <CanvasLegend />

      <!-- Modo Relaciones: reglas a la izquierda, sin selector de flujos -->
      <CanvasRules
        v-if="diagram && mode === 'relations'"
        :rules="rulesData"
        :overview="diagram.data?.model?.overview || ''"
      />

      <!-- Modo Flujos: panel de pasos del flujo activo a la izquierda,
           selector de flujos a la derecha -->
      <CanvasFlowPanel
        v-if="diagram && mode === 'flows'"
        :flow="activeFlow"
        :selected-node-id="selectedId"
        @close="setMode('relations')"
      />
      <CanvasFlowSelector
        v-if="diagram && mode === 'flows'"
        :flows="flowsData"
        :active-id="activeFlowId"
        @select="(id) => activeFlowId = id"
      />

      <VueFlow
        v-if="diagram"
        :nodes="filteredNodes"
        :edges="filteredEdges"
        :node-types="nodeTypes"
        :edge-types="edgeTypes"
        :default-edge-options="{ type: 'floating' }"
        :min-zoom="0.15"
        :max-zoom="2"
        fit-view-on-init
        :fit-view-params="{ padding: 0.14, maxZoom: 0.9, minZoom: 0.2 }"
        @node-click="onNodeClick"
        @node-double-click="onNodeDoubleClick"
        @pane-click="onPaneClick"
        @nodes-change="handleNodesChange"
        style="width: 100%; height: 100%;"
      >
        <Background pattern-color="var(--border)" :gap="24" :size="1" variant="dots" />
        <Controls position="bottom-right" :show-interactive="false" />
      </VueFlow>

      <SidePanel
        :node="selectedNode"
        :model="diagram?.data?.model"
        @close="selectedId = null"
        @select="(id) => selectedId = id"
      />
    </div>
  </div>
</template>
