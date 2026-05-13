<!--
  CanvasFolders.vue

  Panel flotante en la esquina superior izquierda del deep-dive de un
  módulo. Lista las carpetas del módulo con el color asignado a cada una;
  los archivos del canvas llevan el mismo color como acento para
  identificar visualmente a qué carpeta pertenecen.

  Sigue el mismo patrón pill/panel que CanvasRules.
-->
<script setup>
import { ref, computed } from 'vue'
import { Folder, ChevronUp, ChevronDown } from 'lucide-vue-next'

const props = defineProps({
  folders: { type: Array, default: () => [] },
})

const open = ref(false)

const total = computed(() => props.folders.length)
</script>

<template>
  <!-- Pill colapsado -->
  <button
    v-if="!open"
    class="absolute z-[5] bg-surface inline-flex items-center font-mono text-fg-subtle hover:text-fg transition-colors duration-100"
    :style="{
      top: '12px',
      left: '12px',
      border: '1px solid var(--border)',
      borderRadius: '6px',
      padding: '7px 12px',
      fontSize: '12px',
      letterSpacing: '0.03em',
      boxShadow: 'var(--shadow-sm)',
      gap: '8px',
    }"
    @click="open = true"
  >
    <Folder :size="13" class="text-fg-muted" />
    <span class="text-fg" style="font-weight: 600;">{{ total }}</span>
    {{ total === 1 ? 'carpeta' : 'carpetas' }}
    <ChevronDown :size="13" style="opacity: 0.5;" />
  </button>

  <!-- Panel expandido -->
  <div
    v-else
    class="absolute z-[5] bg-surface rounded-md overflow-hidden"
    :style="{
      top: '12px',
      left: '12px',
      border: '1px solid var(--border)',
      boxShadow: 'var(--shadow-md)',
      width: '240px',
      maxHeight: 'calc(100vh - 100px)',
      overflowY: 'auto',
    }"
  >
    <!-- Header -->
    <button
      class="w-full flex items-center justify-between text-fg-subtle hover:bg-bg-subtle transition-colors duration-100"
      :style="{ padding: '8px 12px', fontSize: '12px', letterSpacing: '0.03em' }"
      @click="open = false"
    >
      <span class="inline-flex items-center" style="gap: 8px;">
        <Folder :size="13" class="text-fg-muted" />
        <span class="text-fg" style="font-weight: 600;">Carpetas del módulo</span>
      </span>
      <ChevronUp :size="13" style="opacity: 0.5;" />
    </button>

    <!-- Estado vacío -->
    <div
      v-if="folders.length === 0"
      class="text-fg-faint font-mono"
      :style="{ padding: '10px 12px', fontSize: '11px', borderTop: '1px solid var(--border-subtle)' }"
    >
      Sin carpetas declaradas
    </div>

    <!-- Lista de carpetas -->
    <div
      v-for="f in folders"
      :key="f.id"
      class="flex items-center"
      :style="{
        padding: '8px 12px',
        gap: '10px',
        borderTop: '1px solid var(--border-subtle)',
      }"
    >
      <span
        :style="{
          width: '10px',
          height: '10px',
          borderRadius: '3px',
          background: f.color,
          flexShrink: 0,
        }"
      />
      <div class="flex-1 min-w-0">
        <div
          class="text-fg font-mono font-medium truncate"
          style="font-size: 12px;"
        >{{ f.label }}</div>
        <div
          v-if="f.path"
          class="text-fg-faint font-mono truncate"
          style="font-size: 10px; margin-top: 1px;"
        >{{ f.path }}</div>
      </div>
      <span
        class="font-mono text-fg-faint"
        :style="{ fontSize: '10.5px' }"
      >{{ f.fileCount }}</span>
    </div>
  </div>
</template>
