<!--
  BotTreeNode.vue

  Nodo recursivo del árbol de archivos generados por el bot.
  Renderiza una carpeta (con sus hijos) o un archivo (con botón de borrar).

  Cuando es un archivo, al hacer click emite `select` con el nodo entero.
  Al pulsar el icono de papelera emite `delete` con el path del archivo.
-->
<script setup>
import { Folder, FileText, Trash2 } from 'lucide-vue-next'

const props = defineProps({
  node: { type: Object, required: true },
  selected: { type: String, default: '' },
  depth: { type: Number, default: 0 },
})

const emit = defineEmits(['select', 'delete'])
</script>

<template>
  <div v-if="node.type === 'dir'">
    <div
      class="flex items-center text-fg-muted"
      :style="{
        gap: '6px',
        padding: `4px 8px 4px ${8 + depth * 12}px`,
        fontWeight: 500,
      }"
    >
      <Folder :size="12" />
      <span>{{ node.name }}/</span>
    </div>
    <BotTreeNode
      v-for="child in node.entries"
      :key="child.name + (child.path || '')"
      :node="child"
      :selected="selected"
      :depth="depth + 1"
      @select="(f) => emit('select', f)"
      @delete="(p) => emit('delete', p)"
    />
  </div>

  <div
    v-else
    class="flex items-center rounded"
    :style="{
      gap: '6px',
      padding: `4px 8px 4px ${8 + depth * 12}px`,
      background: selected === node.path ? 'var(--bg-muted)' : 'transparent',
      cursor: 'pointer',
      color: 'var(--fg)',
    }"
    @click="emit('select', node)"
  >
    <FileText :size="12" class="text-fg-faint flex-shrink-0" />
    <span
      class="flex-1 overflow-hidden whitespace-nowrap"
      style="text-overflow: ellipsis;"
    >{{ node.name }}</span>
    <button
      class="text-fg-faint hover:text-danger"
      style="border: none; background: transparent; cursor: pointer; padding: 2px; display: flex;"
      title="Borrar archivo"
      @click.stop="emit('delete', node.path)"
    >
      <Trash2 :size="11" />
    </button>
  </div>
</template>
