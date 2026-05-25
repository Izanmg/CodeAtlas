<!--
  ModuleDeepDiveView.vue

  Canvas interno de un módulo concreto. Renderiza:
    - Cabeceras de carpeta (estilo etiqueta)
    - Nodos UML por archivo (header + lista de funciones)
    - Frontier nodes en los bordes para pantallas y módulos relacionados

  Modos:
    - "relations": pinta file.imports + binding screen.file
    - "flows":     pinta secuencia numerada del flujo activo entre archivos
                   del módulo (usando step.file/step.fn)

  Layout:
    - Estado se calcula una vez al cargar y se persiste en local únicamente
      (no se sube al backend en v1; se podrá añadir en una iteración posterior).
-->
<script setup>
import { ref, computed, onMounted, onUnmounted, markRaw, nextTick, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { VueFlow, useVueFlow } from '@vue-flow/core'
import { Background } from '@vue-flow/background'
import { Controls } from '@vue-flow/controls'
import { ArrowLeft, Workflow, Network, Undo2, Redo2, Save, CheckCircle2 } from 'lucide-vue-next'

import { useDiagramsStore } from '../stores/diagrams.store'
import { buildDeepDive, buildFlowEdgesForModule } from '../core/auto-layout-deep'

import FileNode      from '../components/nodes/FileNode.vue'
import FloatingEdge  from '../components/FloatingEdge.vue'
import CanvasFolders      from '../components/CanvasFolders.vue'
import CanvasModuleDeps   from '../components/CanvasModuleDeps.vue'
import CanvasFlowSelector from '../components/CanvasFlowSelector.vue'
import CanvasFlowPanel    from '../components/CanvasFlowPanel.vue'
import SidePanel          from '../components/SidePanel.vue'
import Button from '@/components/ui/Button.vue'

const route = useRoute()
const router = useRouter()
const diagramsStore = useDiagramsStore()

const diagram = ref(null)
const module  = ref(null)
const nodes       = ref([])
const edges       = ref([])
const folders     = ref([])
const moduleDeps  = ref([])
const screenDeps  = ref([])

const mode = ref('relations')   // 'relations' | 'flows'
const activeFlowId = ref(null)
const selectedId = ref(null)

// Historial de posiciones (undo/redo) — solo aplica a los FileNodes del
// deep-dive. Misma estructura que en DiagramView.
const snapshots   = ref([])
const snapshotIdx = ref(-1)
const canUndo = computed(() => snapshotIdx.value > 0)
const canRedo = computed(() => snapshotIdx.value < snapshots.value.length - 1)
const dirty   = computed(() => snapshotIdx.value > 0)
const saving  = ref(false)
const saved   = ref(false)

/**
 * Captura las posiciones de los FileNodes como snapshot { [nodeId]: { x, y } }.
 * Solo incluye nodos de archivo (los frontiers/folders no se mueven).
 *
 * @returns {Object<string, {x: number, y: number}>} Mapa de posiciones
 */
function captureSnapshot() {
  const snap = {}
  nodes.value.forEach((n) => {
    if (n.id.startsWith('file-')) snap[n.id] = { x: n.position.x, y: n.position.y }
  })
  return snap
}

/**
 * Apila un snapshot en el historial, descartando los "futuros" si se había
 * deshecho (rama nueva del historial).
 *
 * @param {Object<string, {x: number, y: number}>} snap - Snapshot a guardar
 */
function pushSnapshot(snap) {
  snapshots.value = snapshots.value.slice(0, snapshotIdx.value + 1)
  snapshots.value.push(snap)
  snapshotIdx.value = snapshots.value.length - 1
}

const applyingSnapshot = ref(false)

/**
 * Mueve cada nodo a la posición de un snapshot. Activa applyingSnapshot para
 * que handleNodesChange ignore los eventos del cambio programático.
 *
 * @param {Object<string, {x: number, y: number}>} snap - Snapshot a aplicar
 */
function applySnapshot(snap) {
  applyingSnapshot.value = true
  nodes.value = nodes.value.map((n) =>
    snap[n.id] ? { ...n, position: snap[n.id] } : n
  )
  nextTick(() => { applyingSnapshot.value = false })
}

/** Deshace el último movimiento de archivos (retrocede un snapshot). */
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

// Acumulamos posiciones durante el drag y commiteamos al recibir
// dragging:false. Misma técnica que DiagramView.
const pendingDragPositions = new Map()

/**
 * Handler de @nodes-change: acumula posiciones durante el arrastre y, al soltar
 * (dragging === false), commitea el movimiento y crea un snapshot.
 *
 * @param {Array<object>} changes - Cambios emitidos por VueFlow
 */
function handleNodesChange(changes) {
  if (applyingSnapshot.value) return
  let dragEnded = false
  for (const c of changes) {
    if (c.type !== 'position') continue
    if (c.position) pendingDragPositions.set(c.id, { x: c.position.x, y: c.position.y })
    if (c.dragging === false) dragEnded = true
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

/**
 * Persiste las posiciones de los archivos del módulo en el backend y reinicia
 * el historial dejando este estado como base. Muestra "Guardado" durante 2 s.
 *
 * @returns {Promise<void>}
 */
async function saveLayout() {
  if (!module.value) return
  saving.value = true
  try {
    const layout = captureSnapshot()
    await diagramsStore.saveModuleLayout(diagram.value.id, module.value.id, layout)
    // Reset del historial: el snapshot actual pasa a ser la base.
    snapshots.value = [layout]
    snapshotIdx.value = 0
    saved.value = true
    setTimeout(() => { saved.value = false }, 2000)
  } finally {
    saving.value = false
  }
}

// Nodo de archivo seleccionado (el que alimenta el side panel), o null.
const selectedNode = computed(() =>
  nodes.value.find((n) => n.id === selectedId.value) || null
)

/** Click en un nodo: solo los archivos abren el side panel; el resto deselecciona. */
function onNodeClick({ node }) {
  if (node?.data?.kind === 'file') selectedId.value = node.id
  else selectedId.value = null
}

/** Click en el lienzo vacío: deselecciona. */
function onPaneClick() { selectedId.value = null }

const nodeTypes = {
  file: markRaw(FileNode),
}

const edgeTypes = {
  floating: markRaw(FloatingEdge),
}

const { fitView } = useVueFlow()

/**
 * Carga el diagrama, localiza el módulo indicado y construye su deep-dive
 * (nodos de archivo, edges, carpetas y dependencias). Redirige si el diagrama o
 * el módulo no existen. Reinicia el estado de la vista y el historial.
 *
 * @param {string} id - Id del diagrama
 * @param {string} mid - Id del módulo a mostrar
 * @returns {Promise<void>}
 */
async function loadModule(id, mid) {
  const d = await diagramsStore.fetchById(id)
  if (!d) {
    router.push('/')
    return
  }
  diagram.value = d

  const allModules = [
    ...(d.data.model.modules.backend || []),
    ...(d.data.model.modules.frontend || []),
  ]
  const m = allModules.find((x) => x.id === mid)
  if (!m) {
    router.push(`/diagrams/${id}`)
    return
  }
  module.value = m

  const savedLayout = d.data.layout?.modules?.[mid] ?? {}
  const built = buildDeepDive(m, d.data.model, savedLayout)
  nodes.value      = built.nodes
  edges.value      = built.edges
  folders.value    = built.folders
  moduleDeps.value = built.moduleDeps
  screenDeps.value = built.screenDeps

  // Reset del estado dependiente del nodo activo.
  selectedId.value = null
  activeFlowId.value = null
  mode.value = 'relations'

  // Snapshot base = posiciones iniciales (saved si existía o defaults).
  snapshots.value   = [captureSnapshot()]
  snapshotIdx.value = 0
}

onMounted(() => loadModule(route.params.id, route.params.moduleId))

// Cuando el usuario navega de un módulo a otro sin salir de la vista
// (p.ej. desde CanvasModuleDeps) Vue Router reusa el componente y
// onMounted NO se vuelve a disparar. Observamos los params para recargar.
watch(
  () => [route.params.id, route.params.moduleId],
  ([newId, newMid], [oldId, oldMid]) => {
    if (newId === oldId && newMid === oldMid) return
    if (route.name !== 'module-deep-dive') return
    loadModule(newId, newMid)
  },
)

// Lista de flujos del diagrama (para el selector y el panel de flujos).
const flowsData = computed(() => diagram.value?.data?.model?.flows ?? [])

// Flujo activo en modo flujos (o null si se muestran "todos los flujos").
const activeFlow = computed(() =>
  flowsData.value.find((f) => f.id === activeFlowId.value) ?? null
)

// Edges numeradas del/los flujo(s) en modo flujos. Con flujo activo solo el
// suyo; sin él, agrega las transiciones de todos los flujos del módulo.
const flowEdgesComputed = computed(() => {
  if (mode.value !== 'flows' || !module.value) return []
  // Sin flujo activo: agrega de todos los flujos.
  const flows = activeFlow.value ? [activeFlow.value] : flowsData.value
  return flows.flatMap((f) => buildFlowEdgesForModule(f, module.value))
})

const filteredEdges = computed(() => {
  if (mode.value === 'flows') {
    // Edges base atenuadas + edges del flujo destacadas.
    const dimBase = edges.value.map((e) => ({
      ...e,
      style: { ...e.style, strokeOpacity: 0.18 },
    }))
    return [...dimBase, ...flowEdgesComputed.value]
  }
  return edges.value
})

/**
 * Cambia el modo del canvas. Al entrar en 'flows' arranca mostrando todos los flujos.
 *
 * @param {'relations'|'flows'} next - Modo destino
 */
function setMode(next) {
  mode.value = next
  if (next === 'flows') activeFlowId.value = null
}

/** Vuelve a la vista del diagrama completo. */
function goBack() {
  router.push(`/diagrams/${route.params.id}`)
}

/**
 * Atajos de teclado: Esc vuelve al diagrama, Ctrl/Cmd+Z deshace y
 * Ctrl/Cmd+Y (o Ctrl/Cmd+Shift+Z) rehace.
 *
 * @param {KeyboardEvent} e
 */
function onKeydown(e) {
  if (e.key === 'Escape') {
    goBack()
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
</script>

<template>
  <div class="absolute inset-0 bg-bg-canvas">
    <!-- Topbar -->
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
        title="Volver al diagrama (Esc)"
        @click="goBack"
      >
        <ArrowLeft :size="13" /> Salir
      </button>

      <div
        class="flex items-center min-w-0 flex-1 font-mono text-fg-subtle"
        style="gap: 8px; font-size: 12px;"
      >
        <span class="text-fg-faint hidden sm:inline">{{ diagram?.name }}</span>
        <span class="text-fg-faint hidden sm:inline">/</span>
        <span class="text-fg font-medium whitespace-nowrap overflow-hidden text-ellipsis">
          {{ module?.name }}
        </span>
        <span
          v-if="module?.layer"
          class="font-mono uppercase rounded text-fg-faint bg-bg-muted"
          :style="{ fontSize: '9px', letterSpacing: '0.07em', padding: '2px 6px', marginLeft: '4px' }"
        >{{ module.layer }}</span>
      </div>

      <!-- Undo / Redo / Guardar -->
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

      <!-- Toggle modo -->
      <div
        class="flex items-center bg-bg-subtle rounded"
        :style="{ padding: '3px', gap: '2px', border: '1px solid var(--border)' }"
      >
        <button
          class="inline-flex items-center transition-all duration-100"
          :style="{
            padding: '0 9px',
            height: '22px',
            background: mode === 'relations' ? 'var(--surface)' : 'transparent',
            border: `1px solid ${mode === 'relations' ? 'var(--border)' : 'transparent'}`,
            borderRadius: '3px',
            color: mode === 'relations' ? 'var(--fg)' : 'var(--fg-subtle)',
            fontSize: '11.5px',
            fontWeight: 500,
            gap: '6px',
          }"
          @click="setMode('relations')"
        >
          <Network :size="11" /> Relaciones
        </button>
        <button
          class="inline-flex items-center transition-all duration-100"
          :style="{
            padding: '0 9px',
            height: '22px',
            background: mode === 'flows' ? 'var(--surface)' : 'transparent',
            border: `1px solid ${mode === 'flows' ? 'var(--border)' : 'transparent'}`,
            borderRadius: '3px',
            color: mode === 'flows' ? 'var(--kind-flow)' : 'var(--fg-subtle)',
            fontSize: '11.5px',
            fontWeight: 500,
            gap: '6px',
          }"
          @click="setMode('flows')"
        >
          <Workflow :size="11" /> Flujos
        </button>
      </div>
    </div>

    <!-- Área del lienzo -->
    <div class="absolute left-0 right-0" :style="{ top: '48px', bottom: 0 }">
      <CanvasFolders
        v-if="diagram && mode === 'relations'"
        :folders="folders"
      />
      <CanvasModuleDeps
        v-if="diagram && mode === 'relations'"
        :modules="moduleDeps"
        :screens="screenDeps"
        @select-file="(fileId) => selectedId = `file-${fileId}`"
      />
      <CanvasFlowPanel
        v-if="diagram && mode === 'flows'"
        :flow="activeFlow"
        :selected-node-id="null"
        @close="setMode('relations')"
      />
      <CanvasFlowSelector
        v-if="diagram && mode === 'flows'"
        :flows="flowsData"
        :active-id="activeFlowId"
        @select="(id) => activeFlowId = id"
      />

      <VueFlow
        v-if="module"
        :nodes="nodes"
        :edges="filteredEdges"
        :node-types="nodeTypes"
        :edge-types="edgeTypes"
        :default-edge-options="{ type: 'floating' }"
        :min-zoom="0.2"
        :max-zoom="2"
        fit-view-on-init
        :fit-view-params="{ padding: 0.2, maxZoom: 1, minZoom: 0.3 }"
        @node-click="onNodeClick"
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

      <!-- Estado vacío cuando el módulo no tiene archivos documentados -->
      <div
        v-if="module && !module.files?.length"
        class="absolute inset-0 grid place-items-center pointer-events-none"
      >
        <div
          class="text-fg-muted text-center bg-surface rounded-lg"
          :style="{
            padding: '24px 32px',
            border: '1px dashed var(--border-strong)',
            fontSize: '13px',
            maxWidth: '380px',
          }"
        >
          Este módulo no tiene archivos documentados. Añade <code class="font-mono text-fg">files:</code> al frontmatter para ver su estructura interna.
        </div>
      </div>
    </div>
  </div>
</template>
