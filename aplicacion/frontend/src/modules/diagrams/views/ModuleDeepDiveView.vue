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
import { ref, computed, onMounted, onUnmounted, markRaw } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { VueFlow, useVueFlow } from '@vue-flow/core'
import { Background } from '@vue-flow/background'
import { Controls } from '@vue-flow/controls'
import { ArrowLeft, Workflow, Network } from 'lucide-vue-next'

import { useDiagramsStore } from '../stores/diagrams.store'
import { buildDeepDive, buildFlowEdgesForModule } from '../core/auto-layout-deep'

import FileNode      from '../components/nodes/FileNode.vue'
import FolderNode    from '../components/nodes/FolderNode.vue'
import FrontierNode  from '../components/nodes/FrontierNode.vue'
import FloatingEdge  from '../components/FloatingEdge.vue'
import CanvasFlowSelector from '../components/CanvasFlowSelector.vue'
import CanvasFlowPanel    from '../components/CanvasFlowPanel.vue'

const route = useRoute()
const router = useRouter()
const diagramsStore = useDiagramsStore()

const diagram = ref(null)
const module  = ref(null)
const nodes   = ref([])
const edges   = ref([])

const mode = ref('relations')   // 'relations' | 'flows'
const activeFlowId = ref(null)

const nodeTypes = {
  file:     markRaw(FileNode),
  folder:   markRaw(FolderNode),
  frontier: markRaw(FrontierNode),
}

const edgeTypes = {
  floating: markRaw(FloatingEdge),
}

const { fitView } = useVueFlow()

onMounted(async () => {
  const id  = route.params.id
  const mid = route.params.moduleId

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

  const built = buildDeepDive(m, d.data.model)
  nodes.value = built.nodes
  edges.value = built.edges
})

const flowsData = computed(() => diagram.value?.data?.model?.flows ?? [])

// En modo flujos: si hay flujo activo, calcula sus edges numeradas y las
// añade encima de las edges base (que se quedan tenues para contexto).
const activeFlow = computed(() =>
  flowsData.value.find((f) => f.id === activeFlowId.value) ?? null
)

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

function setMode(next) {
  mode.value = next
  if (next === 'flows') activeFlowId.value = null
}

function goBack() {
  router.push(`/diagrams/${route.params.id}`)
}

function onKeydown(e) {
  if (e.key === 'Escape') goBack()
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
        style="width: 100%; height: 100%;"
      >
        <Background pattern-color="var(--border)" :gap="24" :size="1" variant="dots" />
        <Controls position="bottom-right" :show-interactive="false" />
      </VueFlow>

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
