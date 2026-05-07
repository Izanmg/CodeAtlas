<!--
  FrontendNode.vue

  Nodo de módulo frontend. Muestra hasta 5 pantallas que contiene con un
  punto naranja a la izquierda y la ruta de la pantalla a la derecha.
  Si hay más, añade fila "+ N más".

  Para resolver el nombre y ruta de cada pantalla a partir de su id,
  necesita acceso al modelo completo. Lo recibe vía
  `data._allScreens` poblado por el canvas al construir los nodos.
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

const MAX = 5
const screens = computed(() => props.data.screens || [])
const shown = computed(() => screens.value.slice(0, MAX))
const rest = computed(() => screens.value.length - shown.value.length)

function screenInfo(id) {
  const list = props.data._allScreens || []
  const found = list.find((s) => s.id === id)
  return { name: found?.name || id, route: found?.route || '' }
}
</script>

<template>
  <NodeHandles />
  <NodeShell
    :selected="selected"
    kind="frontend"
    :width="230"
    :title="data.name"
    :count="screens.length"
    count-label="pantallas"
  >
    <div
      v-for="(sid, i) in shown"
      :key="sid"
      class="flex items-center"
      :style="{
        padding: '4px 11px',
        gap: '7px',
        borderTop: i === 0 ? 'none' : '1px solid var(--border-subtle)',
        lineHeight: 1.35,
      }"
    >
      <span
        class="flex-shrink-0"
        :style="{
          width: '4px',
          height: '4px',
          borderRadius: '2px',
          background: 'var(--kind-screen)',
        }"
      />
      <span
        class="text-fg font-medium flex-shrink-0"
        style="font-size: 11px;"
      >{{ screenInfo(sid).name }}</span>
      <span
        class="font-mono text-fg-faint ml-auto whitespace-nowrap overflow-hidden text-ellipsis"
        style="font-size: 10px;"
      >{{ screenInfo(sid).route }}</span>
    </div>
    <div
      v-if="rest > 0"
      class="font-mono text-fg-faint bg-bg-subtle"
      :style="{
        padding: '4px 11px 6px',
        fontSize: '10px',
        letterSpacing: '0.04em',
        borderTop: '1px solid var(--border-subtle)',
      }"
    >+ {{ rest }} más</div>
  </NodeShell>
</template>
