<!--
  NodeHandles.vue

  Cuatro handles invisibles (top/bottom/left/right) usados por todos los
  nodos custom para conectar edges. Los handles laterales tienen id 'l' y
  'r' para que el auto-layout pueda elegir de qué lado nace cada conexión.
-->
<script setup>
import { Handle, Position } from '@vue-flow/core'

const HANDLE_STYLE = { opacity: 0, width: '6px', height: '6px' }
</script>

<template>
  <Handle type="target" :position="Position.Top" :style="HANDLE_STYLE" />
  <Handle type="source" :position="Position.Bottom" :style="HANDLE_STYLE" />
  <Handle type="target" :position="Position.Left" :style="HANDLE_STYLE" id="l" />
  <Handle type="source" :position="Position.Right" :style="HANDLE_STYLE" id="r" />
</template>
