<!--
  FlowNode.vue

  Nodo de flujo de negocio. Muestra el trigger en una sola fila —
  los pasos completos viven en el side panel.
-->
<script setup>
import NodeShell from './NodeShell.vue'
import NodeHandles from './NodeHandles.vue'

defineOptions({ inheritAttrs: false })

defineProps({
  data: { type: Object, required: true },
  selected: { type: Boolean, default: false },
})
</script>

<template>
  <NodeHandles />
  <NodeShell
    :selected="selected"
    kind="flow"
    :width="240"
    :title="data.name"
    :count="(data.steps || []).length"
    count-label="pasos"
  >
    <div
      v-if="data.trigger"
      class="text-fg-muted"
      :style="{
        padding: '5px 11px',
        fontSize: '10.5px',
        lineHeight: 1.35,
        borderTop: '1px solid var(--border-subtle)',
      }"
    >
      <span
        class="font-mono uppercase mr-1.5"
        :style="{
          fontSize: '9px',
          letterSpacing: '0.06em',
          color: 'var(--kind-flow)',
        }"
      >trigger</span>
      {{ data.trigger }}
    </div>
  </NodeShell>
</template>
