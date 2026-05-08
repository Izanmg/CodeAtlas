<!--
  NodeHandles.vue

  Ocho handles invisibles: cada lado del nodo expone uno de tipo `source`
  y otro de tipo `target` para poder conectar edges en cualquier dirección.
  Los IDs siguen la convención `<lado>-<tipo>` donde lado ∈ t/r/b/l y
  tipo ∈ s (source) / t (target). El auto-layout y la lógica de drag
  eligen dinámicamente el par de handles más cercano entre dos nodos.
-->
<script setup>
import { Handle, Position } from '@vue-flow/core'

const HANDLE_STYLE = { opacity: 0, width: '6px', height: '6px' }
</script>

<template>
  <Handle type="source" :position="Position.Top"    :style="HANDLE_STYLE" id="t-s" />
  <Handle type="target" :position="Position.Top"    :style="HANDLE_STYLE" id="t-t" />
  <Handle type="source" :position="Position.Right"  :style="HANDLE_STYLE" id="r-s" />
  <Handle type="target" :position="Position.Right"  :style="HANDLE_STYLE" id="r-t" />
  <Handle type="source" :position="Position.Bottom" :style="HANDLE_STYLE" id="b-s" />
  <Handle type="target" :position="Position.Bottom" :style="HANDLE_STYLE" id="b-t" />
  <Handle type="source" :position="Position.Left"   :style="HANDLE_STYLE" id="l-s" />
  <Handle type="target" :position="Position.Left"   :style="HANDLE_STYLE" id="l-t" />
</template>
