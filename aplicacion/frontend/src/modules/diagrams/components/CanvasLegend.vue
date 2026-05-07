<!--
  CanvasLegend.vue

  Leyenda flotante en la esquina inferior izquierda. Empieza colapsada
  como una pastilla con la palabra "Leyenda"; al hacer clic se expande
  mostrando los tipos de bloque y los estilos de conexión.
-->
<script setup>
import { ref } from 'vue'
import { AlertCircle, ChevronDown } from 'lucide-vue-next'
import { NODE_META, KIND_KEYS } from '../core/node-meta'

const open = ref(false)
</script>

<template>
  <button
    v-if="!open"
    class="absolute z-[5] bg-surface inline-flex items-center font-mono text-fg-subtle uppercase"
    :style="{
      bottom: '12px',
      left: '12px',
      border: '1px solid var(--border)',
      borderRadius: '4px',
      padding: '5px 9px',
      fontSize: '10.5px',
      letterSpacing: '0.04em',
      boxShadow: 'var(--shadow-xs)',
      gap: '6px',
    }"
    @click="open = true"
  >
    <AlertCircle :size="11" /> Leyenda
  </button>
  <div
    v-else
    class="absolute z-[5] bg-surface rounded-md overflow-hidden"
    :style="{
      bottom: '12px',
      left: '12px',
      border: '1px solid var(--border)',
      boxShadow: 'var(--shadow-md)',
      width: '220px',
    }"
  >
    <button
      class="w-full flex items-center justify-between font-mono text-fg-subtle uppercase"
      :style="{
        padding: '8px 12px',
        fontSize: '10.5px',
        letterSpacing: '0.06em',
      }"
      @click="open = false"
    >
      Tipos de bloque
      <ChevronDown :size="11" />
    </button>
    <div class="flex flex-col" style="padding: 0 12px 10px; gap: 5px;">
      <div
        v-for="k in KIND_KEYS"
        :key="k"
        class="flex items-center"
        style="font-size: 12px; gap: 8px;"
      >
        <span
          class="flex-shrink-0 rounded-xs"
          :style="{
            width: '10px',
            height: '10px',
            borderRadius: '3px',
            background: NODE_META[k].color,
          }"
        />
        <span class="text-fg-muted">{{ NODE_META[k].label }}</span>
      </div>
    </div>
    <div
      class="flex flex-col text-fg-subtle bg-bg-subtle"
      :style="{
        padding: '8px 12px',
        borderTop: '1px solid var(--border-subtle)',
        fontSize: '11px',
        gap: '4px',
      }"
    >
      <div class="flex items-center" style="gap: 8px;">
        <svg width="20" height="6">
          <line x1="0" y1="3" x2="20" y2="3" stroke="var(--fg-muted)" stroke-width="1.4" />
        </svg>
        <span>conexión directa</span>
      </div>
      <div class="flex items-center" style="gap: 8px;">
        <svg width="20" height="6">
          <line x1="0" y1="3" x2="20" y2="3" stroke="var(--fg-muted)" stroke-width="1.4" stroke-dasharray="3 3" />
        </svg>
        <span>uso indirecto</span>
      </div>
    </div>
  </div>
</template>
