<!--
  NodeShell.vue

  Marco común de todos los nodos del diagrama:
    - Borde que pasa al color del tipo cuando está seleccionado
    - Sombra md + ring cuando está seleccionado
    - Header con icono, etiqueta de tipo (mono mayúsculas) y contador
-->
<script setup>
import { computed } from 'vue'
import { NODE_META } from '../../core/node-meta'

const props = defineProps({
  selected: { type: Boolean, default: false },
  kind: { type: String, required: true },
  width: { type: Number, default: 240 },
  title: { type: String, required: true },
  count: { type: [Number, undefined], default: undefined },
  countLabel: { type: String, default: '' },
})

const meta = computed(() => NODE_META[props.kind])

const containerStyle = computed(() => ({
  width: props.width + 'px',
  background: 'var(--surface)',
  border: `1px solid ${props.selected ? meta.value.color : 'var(--border)'}`,
  boxShadow: props.selected
    ? `0 0 0 3px ${meta.value.color}28, var(--shadow-md)`
    : 'var(--shadow-sm)',
}))
</script>

<template>
  <div
    class="rounded-md overflow-hidden font-sans cursor-pointer transition-all duration-100"
    :style="containerStyle"
  >
    <div
      class="flex items-center"
      :style="{
        padding: '9px 11px',
        gap: '9px',
        borderBottom: '1px solid var(--border-subtle)',
      }"
    >
      <div
        class="grid place-items-center flex-shrink-0 rounded"
        :style="{
          width: '22px',
          height: '22px',
          background: meta.bg,
          color: meta.color,
        }"
      >
        <component :is="meta.icon" :size="13" :stroke-width="2" />
      </div>
      <div class="min-w-0 flex-1">
        <div
          class="font-mono font-medium"
          :style="{
            fontSize: '9.5px',
            color: meta.color,
            letterSpacing: '0.06em',
            lineHeight: 1,
            marginBottom: '2px',
          }"
        >{{ meta.label }}</div>
        <div
          class="text-fg font-semibold whitespace-nowrap overflow-hidden text-ellipsis"
          :style="{ fontSize: '12.5px', letterSpacing: '-0.01em', lineHeight: 1.2 }"
        >{{ title }}</div>
      </div>
      <div
        v-if="count !== undefined"
        class="font-mono text-fg-subtle bg-bg-muted rounded flex-shrink-0"
        :style="{ fontSize: '11px', padding: '1px 6px' }"
        :title="countLabel"
      >{{ count }}</div>
    </div>
    <slot />
  </div>
</template>
