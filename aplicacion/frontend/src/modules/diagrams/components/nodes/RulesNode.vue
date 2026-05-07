<!--
  RulesNode.vue

  Nodo de "Reglas del sistema". Resume las tres categorías
  (auth/nav/conv) con su número de reglas. El detalle completo va al
  side panel.
-->
<script setup>
import { computed } from 'vue'
import NodeShell from './NodeShell.vue'
import NodeHandles from './NodeHandles.vue'

defineOptions({ inheritAttrs: false })

const props = defineProps({
  data: { type: Object, required: true },
  selected: { type: Boolean, default: false },
})

const total = computed(() =>
  (props.data.auth?.length || 0) +
  (props.data.navigation?.length || 0) +
  (props.data.conventions?.length || 0)
)

const groups = computed(() => [
  { key: 'auth', tag: 'auth', items: props.data.auth },
  { key: 'navigation', tag: 'nav', items: props.data.navigation },
  { key: 'conventions', tag: 'conv', items: props.data.conventions },
].filter((g) => g.items?.length > 0))
</script>

<template>
  <NodeHandles />
  <NodeShell
    :selected="selected"
    kind="rules"
    :width="220"
    title="Reglas del sistema"
    :count="total"
    count-label="reglas"
  >
    <div
      v-for="g in groups"
      :key="g.key"
      class="font-mono"
      :style="{
        padding: '5px 11px',
        fontSize: '10.5px',
        lineHeight: 1.35,
        borderTop: '1px solid var(--border-subtle)',
      }"
    >
      <span class="text-kind-rules mr-1.5">{{ g.tag }}</span>
      <span class="text-fg-faint">{{ g.items.length }} reglas</span>
    </div>
  </NodeShell>
</template>
