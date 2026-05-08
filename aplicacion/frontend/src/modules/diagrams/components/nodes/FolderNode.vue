<!--
  FolderNode.vue

  Cabecera/etiqueta de carpeta del deep-dive de un módulo. No es un
  contenedor real de Vue Flow (los archivos no son hijos); es un nodo
  visual con el nombre de la carpeta y la ruta. Se posiciona arriba de
  cada columna de archivos.
-->
<script setup>
import { Folder } from 'lucide-vue-next'

defineOptions({ inheritAttrs: false })

defineProps({
  data: { type: Object, required: true },
  selected: { type: Boolean, default: false },
})
</script>

<template>
  <div
    :style="{
      width: data.width + 'px',
      padding: '8px 12px',
      borderRadius: '6px',
      background: 'var(--bg-subtle)',
      border: '1px dashed var(--border)',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      pointerEvents: 'none',
    }"
  >
    <Folder :size="13" class="text-fg-muted" />
    <div class="flex-1 min-w-0">
      <div class="text-fg font-mono font-semibold truncate" style="font-size: 12px;">
        {{ data.name }}
      </div>
      <div
        v-if="data.path"
        class="text-fg-faint font-mono truncate"
        style="font-size: 10px; margin-top: 1px;"
      >{{ data.path }}</div>
    </div>
    <span class="font-mono text-fg-faint" style="font-size: 10px;">
      {{ data.fileCount }}
    </span>
  </div>
</template>
