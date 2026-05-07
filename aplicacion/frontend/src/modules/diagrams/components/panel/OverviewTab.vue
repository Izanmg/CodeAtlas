<!--
  OverviewTab.vue

  Pestaña "Resumen" del side panel. Muestra dos stats relevantes según el
  tipo del nodo y un resumen de las conexiones principales (3 salientes
  + 3 entrantes).
-->
<script setup>
import { computed } from 'vue'
import StatTile from './StatTile.vue'
import PanelSectionHeader from './PanelSectionHeader.vue'
import ConnectionRow from './ConnectionRow.vue'

const props = defineProps({
  node: { type: Object, required: true },
  m: { type: Object, required: true },
  connections: { type: Object, required: true },
})

defineEmits(['select'])

const kind = computed(() => props.node.data.kind)

const topConnections = computed(() => {
  const out = props.connections.outgoing.slice(0, 3)
  const remaining = 3 - out.length
  const inc = props.connections.incoming.slice(0, Math.max(0, remaining + 3))
  return { out, inc }
})
</script>

<template>
  <div class="flex flex-col" style="gap: 18px;">
    <div class="grid" style="grid-template-columns: 1fr 1fr; gap: 8px;">
      <template v-if="kind === 'backend'">
        <StatTile label="endpoints" :value="m.api?.length || 0" />
        <StatTile label="tablas usadas" :value="m.database?.length || 0" />
      </template>
      <template v-else-if="kind === 'frontend'">
        <StatTile label="pantallas" :value="m.screens?.length || 0" />
        <StatTile label="APIs consumidas" :value="m.consumesApi?.length || 0" />
      </template>
      <template v-else-if="kind === 'screen'">
        <StatTile label="ruta" :value="m.route || '—'" mono />
        <StatTile label="auth" :value="m.requiresAuth ? 'sí' : 'no'" />
      </template>
      <template v-else-if="kind === 'database'">
        <StatTile label="columnas" :value="m.fields?.length || 0" />
        <StatTile label="relaciones" :value="m.relations?.length || 0" />
      </template>
      <template v-else-if="kind === 'flow'">
        <StatTile label="pasos" :value="m.steps?.length || 0" />
        <StatTile label="módulos" :value="m.modules?.length || 0" />
      </template>
      <template v-else-if="kind === 'rules'">
        <StatTile label="auth" :value="m.auth?.length || 0" />
        <StatTile label="navegación" :value="m.navigation?.length || 0" />
      </template>
    </div>

    <div v-if="connections.total > 0">
      <PanelSectionHeader>Conexiones principales</PanelSectionHeader>
      <div class="flex flex-col" style="gap: 4px;">
        <ConnectionRow
          v-for="(c, i) in topConnections.out"
          :key="`o-${i}`"
          :c="c"
          dir="out"
          @select="(id) => $emit('select', id)"
        />
        <ConnectionRow
          v-for="(c, i) in topConnections.inc"
          :key="`i-${i}`"
          :c="c"
          dir="in"
          @select="(id) => $emit('select', id)"
        />
      </div>
    </div>
  </div>
</template>
