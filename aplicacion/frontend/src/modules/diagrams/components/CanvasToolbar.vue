<!--
  CanvasToolbar.vue

  Barra flotante en la parte superior central del canvas. Compone:
    - Filtros tipo "chip" para mostrar/ocultar cada tipo de bloque
    - Botones de "ajustar vista" y toggle del minimapa
    - Botón "Salir de foco" cuando hay un nodo seleccionado
-->
<script setup>
import { Maximize, LayoutDashboard, Focus } from 'lucide-vue-next'
import { NODE_META, KIND_KEYS } from '../core/node-meta'

const props = defineProps({
  visible: { type: Object, required: true },     // { backend: bool, ... }
  counts: { type: Object, required: true },      // { backend: n, ... }
  minimapOn: { type: Boolean, default: true },
  focusActive: { type: Boolean, default: false },
})

defineEmits(['toggle', 'fit', 'toggleMinimap', 'clearFocus'])
</script>

<template>
  <div
    class="absolute z-[5] bg-surface rounded-md flex items-center"
    :style="{
      top: '12px',
      left: '50%',
      transform: 'translateX(-50%)',
      border: '1px solid var(--border)',
      padding: '4px',
      gap: '4px',
      boxShadow: 'var(--shadow-md)',
    }"
  >
    <button
      v-for="k in KIND_KEYS"
      :key="k"
      class="inline-flex items-center transition-all duration-100"
      :style="{
        padding: '0 8px',
        height: '24px',
        background: visible[k] ? 'var(--surface)' : 'transparent',
        border: `1px solid ${visible[k] ? 'var(--border)' : 'transparent'}`,
        borderRadius: '4px',
        boxShadow: visible[k] ? 'var(--shadow-xs)' : 'none',
        color: visible[k] ? 'var(--fg)' : 'var(--fg-subtle)',
        fontSize: '11.5px',
        fontWeight: 500,
        gap: '6px',
      }"
      @click="$emit('toggle', k)"
    >
      <span
        :style="{
          width: '7px',
          height: '7px',
          borderRadius: '2px',
          background: NODE_META[k].color,
          opacity: visible[k] ? 1 : 0.35,
        }"
      />
      {{ NODE_META[k].label }}
      <span class="font-mono text-fg-faint" style="font-size: 10.5px;">
        {{ counts[k] || 0 }}
      </span>
    </button>

    <div :style="{ width: '1px', height: '18px', background: 'var(--border)', margin: '0 4px' }" />

    <button
      class="grid place-items-center rounded text-fg-subtle hover:bg-bg-muted hover:text-fg"
      :style="{ width: '24px', height: '24px', border: '1px solid transparent' }"
      title="Ajustar vista"
      @click="$emit('fit')"
    >
      <Maximize :size="13" />
    </button>
    <button
      class="grid place-items-center rounded"
      :style="{
        width: '24px',
        height: '24px',
        border: '1px solid transparent',
        background: minimapOn ? 'var(--bg-muted)' : 'transparent',
        color: minimapOn ? 'var(--fg)' : 'var(--fg-subtle)',
      }"
      title="Minimapa"
      @click="$emit('toggleMinimap')"
    >
      <LayoutDashboard :size="13" />
    </button>

    <template v-if="focusActive">
      <div :style="{ width: '1px', height: '18px', background: 'var(--border)', margin: '0 4px' }" />
      <button
        class="inline-flex items-center bg-accent-soft text-accent"
        :style="{
          padding: '0 8px',
          height: '24px',
          borderRadius: '4px',
          fontSize: '11.5px',
          fontWeight: 500,
          gap: '5px',
          border: '1px solid transparent',
        }"
        @click="$emit('clearFocus')"
      >
        <Focus :size="11" /> Salir de foco
        <kbd style="margin-left: 2px;">esc</kbd>
      </button>
    </template>
  </div>
</template>
