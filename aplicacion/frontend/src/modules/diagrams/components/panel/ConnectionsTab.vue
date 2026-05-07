<!--
  ConnectionsTab.vue

  Pestaña "Conexiones" del side panel. Lista todas las salientes y
  entrantes en dos secciones separadas.
-->
<script setup>
import PanelSectionHeader from './PanelSectionHeader.vue'
import ConnectionRow from './ConnectionRow.vue'

defineProps({
  connections: { type: Object, required: true },
})

defineEmits(['select'])
</script>

<template>
  <div class="flex flex-col" style="gap: 18px;">
    <div v-if="connections.outgoing.length > 0">
      <PanelSectionHeader :count="connections.outgoing.length">Saliente</PanelSectionHeader>
      <div class="flex flex-col" style="gap: 4px;">
        <ConnectionRow
          v-for="(c, i) in connections.outgoing"
          :key="`o-${i}`"
          :c="c"
          dir="out"
          @select="(id) => $emit('select', id)"
        />
      </div>
    </div>
    <div v-if="connections.incoming.length > 0">
      <PanelSectionHeader :count="connections.incoming.length">Entrante</PanelSectionHeader>
      <div class="flex flex-col" style="gap: 4px;">
        <ConnectionRow
          v-for="(c, i) in connections.incoming"
          :key="`i-${i}`"
          :c="c"
          dir="in"
          @select="(id) => $emit('select', id)"
        />
      </div>
    </div>
    <div
      v-if="connections.total === 0"
      class="text-fg-subtle text-center"
      style="font-size: 12.5px; padding: 32px 16px;"
    >
      No tiene conexiones registradas.
    </div>
  </div>
</template>
