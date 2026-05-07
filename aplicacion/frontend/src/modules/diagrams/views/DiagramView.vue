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

  La carga del diagrama se hace por id de la URL contra el store de
  diagramas. Si no se encuentra, redirige al dashboard.
-->
<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { VueFlow, useVueFlow } from '@vue-flow/core'
import { Background } from '@vue-flow/background'
import { Controls } from '@vue-flow/controls'
import { MiniMap } from '@vue-flow/minimap'
import { ArrowLeft } from 'lucide-vue-next'

import { useDiagramsStore } from '../stores/diagrams.store'
import { useProjectsStore } from '@/modules/projects/stores/projects.store'
import { autoLayout } from '../logica-temporal/auto-layout'
import { NODE_META } from '../logica-temporal/node-meta'

import BackendNode from '../components/nodes/BackendNode.vue'
import FrontendNode from '../components/nodes/FrontendNode.vue'
import ScreenNode from '../components/nodes/ScreenNode.vue'
import DatabaseNode from '../components/nodes/DatabaseNode.vue'
import FlowNode from '../components/nodes/FlowNode.vue'
import RulesNode from '../components/nodes/RulesNode.vue'
import CanvasToolbar from '../components/CanvasToolbar.vue'
import CanvasLegend from '../components/CanvasLegend.vue'
import SidePanel from '../components/SidePanel.vue'

const route = useRoute()
const router = useRouter()
const diagramsStore = useDiagramsStore()
const projectsStore = useProjectsStore()

const diagram = ref(null)
const project = ref(null)

const nodes = ref([])
const edges = ref([])
const selectedId = ref(null)
const minimapOn = ref(true)
const visible = ref({
  backend: true, frontend: true, screen: true,
  database: true, flow: true, rules: true,
})

const nodeTypes = {
  backend: BackendNode,
  frontend: FrontendNode,
  screen: ScreenNode,
  database: DatabaseNode,
  flow: FlowNode,
  rules: RulesNode,
}

const { fitView } = useVueFlow()

// Carga el diagrama, el proyecto y construye nodes/edges al montar.
onMounted(async () => {
  const id = route.params.id
  diagram.value = await diagramsStore.fetchById(id)
  if (!diagram.value) {
    router.push('/')
    return
  }
  project.value = await projectsStore.fetchById(diagram.value.projectId)

  const built = autoLayout(diagram.value.data)
  // Inyecta `_allScreens` en los frontends para que puedan resolver
  // los nombres y rutas de las pantallas que contienen.
  const allScreens = diagram.value.data.screens
  nodes.value = built.nodes.map((n) =>
    n.type === 'frontend'
      ? { ...n, data: { ...n.data, _allScreens: allScreens } }
      : n
  )
  edges.value = built.edges
})

// Conjunto de ids relacionados al nodo seleccionado, para el modo foco.
const focusSet = computed(() => {
  if (!selectedId.value) return null
  const set = new Set([selectedId.value])
  edges.value.forEach((e) => {
    if (e.source === selectedId.value) set.add(e.target)
    if (e.target === selectedId.value) set.add(e.source)
  })
  return set
})

// Nodos visibles tras aplicar filtros + clase rf-active para foco.
const filteredNodes = computed(() =>
  nodes.value.map((n) => ({
    ...n,
    hidden: !visible.value[n.data.kind],
    selected: n.id === selectedId.value,
    class: focusSet.value
      ? (focusSet.value.has(n.id) ? 'rf-active' : '')
      : '',
  }))
)

// Edges visibles + clase rf-edge-active para los relacionados con el foco.
const filteredEdges = computed(() =>
  edges.value.map((e) => {
    const src = nodes.value.find((n) => n.id === e.source)
    const tgt = nodes.value.find((n) => n.id === e.target)
    const hidden = !src || !tgt || !visible.value[src.data.kind] || !visible.value[tgt.data.kind]
    const isActive = focusSet.value
      ? (focusSet.value.has(e.source) && focusSet.value.has(e.target))
      : false
    return { ...e, hidden, class: isActive ? 'rf-edge-active' : '' }
  })
)

const selectedNode = computed(() =>
  nodes.value.find((n) => n.id === selectedId.value) || null
)

const counts = computed(() => {
  const c = { backend: 0, frontend: 0, screen: 0, database: 0, flow: 0, rules: 0 }
  nodes.value.forEach((n) => {
    c[n.data.kind] = (c[n.data.kind] || 0) + 1
  })
  return c
})

function toggleFilter(k) {
  visible.value = { ...visible.value, [k]: !visible.value[k] }
}

function onNodeClick({ node }) {
  selectedId.value = node.id
}

function onPaneClick() {
  selectedId.value = null
}

function clearFocus() {
  selectedId.value = null
}

function onKeydown(e) {
  if (e.key === 'Escape' && selectedId.value) selectedId.value = null
}

onMounted(() => window.addEventListener('keydown', onKeydown))
onUnmounted(() => window.removeEventListener('keydown', onKeydown))

function goBack() {
  router.push(project.value ? `/projects/${project.value.id}` : '/')
}

function colorFor(node) {
  return NODE_META[node?.data?.kind]?.color || '#888'
}
</script>

<template>
  <div
    class="absolute inset-0 bg-bg-canvas"
    :class="focusSet ? 'rf-dim' : ''"
  >
    <!-- Top bar propio del diagrama. -->
    <div
      class="absolute left-0 right-0 z-[6] bg-surface flex items-center"
      :style="{
        top: 0,
        height: '48px',
        borderBottom: '1px solid var(--border)',
        padding: '0 12px',
        gap: '12px',
      }"
    >
      <button
        class="inline-flex items-center text-fg-muted hover:bg-bg-subtle hover:text-fg rounded-sm"
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
        <span class="text-fg-faint">{{ project?.name }}</span>
        <span class="text-fg-faint">/</span>
        <span
          class="text-fg font-medium whitespace-nowrap overflow-hidden text-ellipsis"
        >{{ diagram?.name }}</span>
      </div>

      <div
        class="font-mono text-fg-subtle uppercase"
        style="font-size: 10.5px; letter-spacing: 0.06em;"
      >
        {{ nodes.length }} bloques · {{ edges.length }} conexiones
      </div>
    </div>

    <!-- Área del lienzo. -->
    <div class="absolute left-0 right-0" :style="{ top: '48px', bottom: 0 }">
      <CanvasToolbar
        :visible="visible"
        :counts="counts"
        :minimap-on="minimapOn"
        :focus-active="!!focusSet"
        @toggle="toggleFilter"
        @fit="fitView({ padding: 0.12, duration: 400 })"
        @toggle-minimap="minimapOn = !minimapOn"
        @clear-focus="clearFocus"
      />

      <CanvasLegend />

      <VueFlow
        v-if="diagram"
        :nodes="filteredNodes"
        :edges="filteredEdges"
        :node-types="nodeTypes"
        :default-edge-options="{ type: 'smoothstep' }"
        :min-zoom="0.15"
        :max-zoom="2"
        fit-view-on-init
        :fit-view-params="{ padding: 0.14, maxZoom: 0.9, minZoom: 0.2 }"
        @node-click="onNodeClick"
        @pane-click="onPaneClick"
        style="width: 100%; height: 100%;"
      >
        <Background pattern-color="var(--border)" :gap="24" :size="1" variant="dots" />
        <Controls position="bottom-right" :show-interactive="false" />
        <MiniMap
          v-if="minimapOn"
          position="top-right"
          pannable
          zoomable
          :node-color="colorFor"
          :style="{ width: '160px', height: '100px', marginTop: '60px', marginRight: '12px' }"
          mask-color="rgba(0,0,0,0.04)"
        />
      </VueFlow>

      <SidePanel
        :node="selectedNode"
        :model="diagram?.data"
        @close="selectedId = null"
        @select="(id) => selectedId = id"
      />
    </div>
  </div>
</template>
