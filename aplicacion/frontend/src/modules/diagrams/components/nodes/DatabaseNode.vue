<!--
  DatabaseNode.vue

  Nodo de tabla de BD. Muestra todas las columnas con su tag (PK/FK/UQ),
  nombre y tipo. PK aparece en color accent y bold.
-->
<script setup>
import { computed } from 'vue'
import NodeShell from './NodeShell.vue'
import NodeHandles from './NodeHandles.vue'
import NodeFlowChips from './NodeFlowChips.vue'

defineOptions({ inheritAttrs: false })

const props = defineProps({
  data: { type: Object, required: true },
  selected: { type: Boolean, default: false },
})

function onPickFlow(payload) {
  props.data._onPickFlow?.(payload)
}

const fields = computed(() => props.data.fields || [])

function tag(field) {
  if (field.pk) return 'PK'
  if (field.fk) return 'FK'
  if (field.unique) return 'UQ'
  return ''
}

function tagColor(field) {
  if (field.pk) return 'var(--accent)'
  if (field.fk) return 'var(--kind-frontend)'
  return 'var(--fg-faint)'
}
</script>

<template>
  <NodeHandles />
  <NodeShell
    :selected="selected"
    kind="database"
    :width="230"
    :title="data.name"
    :count="fields.length"
    count-label="columnas"
  >
    <div
      v-for="(f, i) in fields"
      :key="i"
      class="flex items-center font-mono"
      :style="{
        padding: '4px 11px',
        gap: '8px',
        fontSize: '10.5px',
        borderTop: i === 0 ? 'none' : '1px solid var(--border-subtle)',
        lineHeight: 1.35,
      }"
    >
      <span
        class="font-semibold flex-shrink-0"
        :style="{
          width: '14px',
          fontSize: '9px',
          letterSpacing: '0.04em',
          color: tagColor(f),
        }"
      >{{ tag(f) }}</span>
      <span
        class="text-fg flex-1 whitespace-nowrap overflow-hidden text-ellipsis"
        :style="{ fontWeight: f.pk ? 600 : 400 }"
      >{{ f.name }}</span>
      <span class="text-fg-faint flex-shrink-0">{{ f.type }}</span>
    </div>
    <NodeFlowChips :chips="data.flowChips || []" @pick-flow="onPickFlow" />
  </NodeShell>
</template>
