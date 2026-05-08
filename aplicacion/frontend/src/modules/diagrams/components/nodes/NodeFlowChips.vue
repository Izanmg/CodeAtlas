<!--
  NodeFlowChips.vue

  Sección al pie de un nodo del canvas que lista los flujos que tienen al
  menos un paso apuntando a ese nodo. Cada flujo aparece como un chip con
  su nombre y el número de pasos que le tocan a este nodo.

  Click en un chip → emite 'pick-flow' con { flowId } para que DiagramView
  active el modo Flujos con ese flujo seleccionado.
-->
<script setup>
import { Workflow } from 'lucide-vue-next'

defineProps({
  chips: {
    // [{ flowId, flowName, stepCount }]
    type: Array,
    default: () => [],
  },
})

defineEmits(['pick-flow'])
</script>

<template>
  <div
    v-if="chips.length > 0"
    :style="{
      borderTop: '1px solid var(--border-subtle)',
      padding: '6px 11px 8px',
      display: 'flex',
      flexDirection: 'column',
      gap: '3px',
    }"
  >
    <div
      class="font-mono uppercase text-fg-faint"
      :style="{ fontSize: '8.5px', letterSpacing: '0.07em', marginBottom: '2px' }"
    >
      flujos
    </div>
    <button
      v-for="c in chips"
      :key="c.flowId"
      class="inline-flex items-center transition-colors duration-100"
      :style="{
        padding: '3px 7px',
        gap: '6px',
        fontSize: '10.5px',
        background: 'var(--kind-flow-bg)',
        color: 'var(--kind-flow)',
        border: '1px solid transparent',
        borderRadius: '4px',
        textAlign: 'left',
      }"
      @click.stop="$emit('pick-flow', { flowId: c.flowId })"
    >
      <Workflow :size="10" />
      <span class="text-fg flex-1 whitespace-nowrap overflow-hidden text-ellipsis" style="font-weight: 500;">
        {{ c.flowName }}
      </span>
      <span class="font-mono text-fg-faint" style="font-size: 9.5px;">
        {{ c.stepCount }} {{ c.stepCount === 1 ? 'paso' : 'pasos' }}
      </span>
    </button>
  </div>
</template>
