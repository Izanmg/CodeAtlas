<!--
  CanvasFlowPanel.vue

  Panel flotante en la esquina superior izquierda del canvas. Solo visible
  en modo Flujos. Reemplaza a CanvasRules. Muestra los pasos del flujo
  activo agrupados por nodo y resalta los pasos del nodo seleccionado.

  Reglas de presentación:
    - Pasos consecutivos con el mismo nodeId → se agrupan bajo una cabecera
      única; los items hijos se ordenan por su índice de paso.
    - Pasos no consecutivos en el mismo nodo → la cabecera se repite con su
      número correspondiente.
    - El nodo seleccionado en el canvas → todos sus grupos reciben un borde
      izquierdo accent.
-->
<script setup>
import { computed } from 'vue'
import { Workflow, ChevronUp } from 'lucide-vue-next'

const props = defineProps({
  flow: { type: Object, default: null },
  selectedNodeId: { type: String, default: null },
})

defineEmits(['close'])

// Agrupa pasos consecutivos con el mismo nodeId. Cada grupo conserva su
// posición (firstIndex) para que los pasos sin agrupar se repitan si vuelven
// a aparecer más adelante.
const groups = computed(() => {
  const steps = props.flow?.steps ?? []
  const result = []
  for (const step of steps) {
    const last = result[result.length - 1]
    if (last && last.nodeId && last.nodeId === step.nodeId) {
      last.steps.push(step)
    } else {
      result.push({
        nodeId: step.nodeId,
        layer: step.layer,
        moduleId: step.moduleId,
        firstIndex: step.index,
        steps: [step],
      })
    }
  }
  return result
})

const layerLabel = (layer) => {
  if (!layer) return ''
  return layer
}

const layerColor = (layer) => {
  if (!layer) return 'var(--fg-faint)'
  return `var(--kind-${layer})`
}
</script>

<template>
  <div
    v-if="flow"
    class="absolute z-[5] bg-surface rounded-md overflow-hidden"
    :style="{
      top: '12px',
      left: '12px',
      border: '1px solid var(--border)',
      boxShadow: 'var(--shadow-md)',
      width: '260px',
      maxHeight: 'calc(100vh - 100px)',
      overflowY: 'auto',
    }"
  >
    <!-- Header -->
    <button
      class="w-full flex items-center justify-between font-mono text-fg-subtle hover:bg-bg-subtle transition-colors duration-100"
      :style="{ padding: '8px 12px', fontSize: '10.5px', letterSpacing: '0.05em' }"
      @click="$emit('close')"
    >
      <span class="inline-flex items-center" style="gap: 6px;">
        <Workflow :size="11" :style="{ color: 'var(--kind-flow)' }" />
        Flujo activo
      </span>
      <ChevronUp :size="11" />
    </button>

    <!-- Nombre + trigger -->
    <div :style="{ padding: '8px 12px 10px', borderTop: '1px solid var(--border-subtle)' }">
      <div
        class="text-fg whitespace-nowrap overflow-hidden text-ellipsis"
        :style="{ fontSize: '13px', fontWeight: 600, letterSpacing: '-0.005em' }"
      >{{ flow.name }}</div>
      <div
        v-if="flow.trigger"
        class="text-fg-muted"
        :style="{ fontSize: '11px', marginTop: '3px', lineHeight: 1.4 }"
      >
        <span class="font-mono uppercase text-fg-faint" :style="{ fontSize: '9px', letterSpacing: '0.07em', marginRight: '5px' }">trigger</span>
        {{ flow.trigger }}
      </div>
    </div>

    <!-- Grupos de pasos -->
    <div
      v-for="(g, gi) in groups"
      :key="gi"
      :style="{
        borderTop: '1px solid var(--border-subtle)',
        borderLeft: g.nodeId && g.nodeId === selectedNodeId ? '2px solid var(--kind-flow)' : '2px solid transparent',
        background: g.nodeId && g.nodeId === selectedNodeId ? 'var(--kind-flow-bg)' : 'transparent',
        padding: '7px 12px',
      }"
    >
      <!-- Cabecera del grupo (capa + moduleId) -->
      <div v-if="g.layer" class="flex items-center" style="gap: 6px; margin-bottom: 4px;">
        <span
          class="font-mono uppercase"
          :style="{
            fontSize: '8.5px',
            letterSpacing: '0.07em',
            padding: '1px 5px',
            borderRadius: '3px',
            background: 'var(--bg-muted)',
            color: layerColor(g.layer),
          }"
        >{{ layerLabel(g.layer) }}</span>
        <span class="text-fg font-medium" style="font-size: 11px;">{{ g.moduleId }}</span>
      </div>

      <!-- Items del grupo -->
      <div
        v-for="step in g.steps"
        :key="step.index"
        :style="{ display: 'flex', gap: '7px', alignItems: 'flex-start', padding: '2px 0' }"
      >
        <span
          class="font-mono flex-shrink-0"
          :style="{
            fontSize: '9.5px',
            color: 'var(--fg-faint)',
            background: 'var(--bg-subtle)',
            borderRadius: '3px',
            padding: '1px 5px',
            marginTop: '2px',
          }"
        >{{ step.index + 1 }}</span>
        <div class="flex-1" style="font-size: 11px; line-height: 1.45;">
          <div
            v-if="step.file || step.fn"
            class="font-mono text-fg-muted"
            :style="{ fontSize: '10px', marginBottom: '1px' }"
          >
            <span v-if="step.file">{{ step.file }}</span>
            <span v-if="step.fn" class="text-fg-faint"> › {{ step.fn }}</span>
          </div>
          <div class="text-fg-muted">{{ step.label }}</div>
        </div>
      </div>
    </div>

    <!-- Sin pasos -->
    <div
      v-if="!flow.steps || flow.steps.length === 0"
      class="text-fg-faint font-mono"
      :style="{ padding: '10px 12px', fontSize: '11px', borderTop: '1px solid var(--border-subtle)' }"
    >
      Este flujo no tiene pasos
    </div>
  </div>
</template>
