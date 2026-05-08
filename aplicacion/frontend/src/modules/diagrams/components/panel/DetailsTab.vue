<!--
  DetailsTab.vue

  Pestaña "Detalle" del side panel. El contenido cambia según el tipo
  del nodo seleccionado:
    - backend → lista de endpoints
    - frontend → tabla de pantallas con sus rutas
    - screen → ruta + badge de auth
    - database → tabla de campos + relaciones
    - flow → trigger + pasos numerados
    - rules → grupos por categoría
-->
<script setup>
import { computed } from 'vue'
import PanelSectionHeader from './PanelSectionHeader.vue'
import Badge from '@/components/ui/Badge.vue'
import { Lock, ExternalLink } from 'lucide-vue-next'

const props = defineProps({
  node: { type: Object, required: true },
  m: { type: Object, required: true },
  model: { type: Object, required: true },
})

const kind = computed(() => props.node.data.kind)

const screens = computed(() => {
  if (kind.value !== 'frontend') return []
  return (props.m.screens || [])
    .map((id) => props.model.screens.find((s) => s.id === id))
    .filter(Boolean)
})

const ruleGroups = computed(() => [
  { label: 'Autenticación', items: props.m.auth },
  { label: 'Navegación', items: props.m.navigation },
  { label: 'Convenciones', items: props.m.conventions },
])

// Parsea el bloque DBML de m.table cuando m.fields no está disponible
// (diagramas generados antes del fix del parser)
function parseDbmlFields(tableText) {
  if (!tableText) return []
  const content = tableText.replace(/```\w*\n?/g, '')
  const tableMatch = content.match(/Table\s+(\w+)\s*\{([^}]+)\}/)
  if (!tableMatch) return []
  const tableName = tableMatch[1]
  const bodyText = tableMatch[2]
  const prefix = tableName + '.'
  const fkFields = new Set()
  for (const line of content.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed.startsWith('Ref:')) continue
    const m = trimmed.slice(4).trim().match(/^(\S+)\s*([><-]|<>)\s*(\S+)/)
    if (!m) continue
    const [, left, op, right] = m
    if (op === '>') {
      if (left.startsWith(prefix)) fkFields.add(left.slice(prefix.length))
    } else if (op === '<') {
      if (right.startsWith(prefix)) fkFields.add(right.slice(prefix.length))
    } else if (op === '-') {
      if (left.startsWith(prefix)) { const f = left.slice(prefix.length); if (f !== 'id') fkFields.add(f) }
      if (right.startsWith(prefix)) { const f = right.slice(prefix.length); if (f !== 'id') fkFields.add(f) }
    }
  }
  const fields = []
  for (const line of bodyText.split('\n')) {
    const m = line.trim().match(/^(\w+)\s+(\w+)(?:\s+\[([^\]]*)\])?/)
    if (!m) continue
    const [, name, type, mods = ''] = m
    const modsLower = mods.toLowerCase()
    fields.push({
      name, type,
      pk: modsLower.includes('pk'),
      fk: modsLower.includes('ref:') || fkFields.has(name),
      unique: modsLower.includes('unique'),
    })
  }
  return fields
}

const dbFields = computed(() =>
  props.m.fields?.length ? props.m.fields : parseDbmlFields(props.m.table)
)
</script>

<template>
  <div class="flex flex-col" style="gap: 16px;">
    <!-- backend -->
    <template v-if="kind === 'backend' && m.api?.length">
      <div>
        <PanelSectionHeader :count="m.api.length">Endpoints</PanelSectionHeader>
        <div class="flex flex-col" style="gap: 3px;">
          <div
            v-for="(it, i) in m.api"
            :key="i"
            class="font-mono text-fg rounded"
            :style="{
              fontSize: '11.5px',
              padding: '5px 9px',
              background: 'var(--bg-subtle)',
              border: '1px solid var(--border-subtle)',
            }"
          >{{ it }}</div>
        </div>
      </div>
    </template>

    <!-- frontend -->
    <template v-if="kind === 'frontend' && screens.length">
      <div>
        <PanelSectionHeader :count="screens.length">Pantallas</PanelSectionHeader>
        <div class="flex flex-col" style="gap: 4px;">
          <div
            v-for="s in screens"
            :key="s.id"
            class="flex justify-between items-center rounded"
            :style="{
              padding: '6px 10px',
              background: 'var(--bg-subtle)',
              border: '1px solid var(--border-subtle)',
              fontSize: '12.5px',
            }"
          >
            <span class="text-fg font-medium">{{ s.name }}</span>
            <span class="font-mono text-fg-subtle" style="font-size: 11px;">{{ s.route }}</span>
          </div>
        </div>
      </div>
    </template>

    <!-- screen -->
    <template v-if="kind === 'screen'">
      <div v-if="m.routes?.length">
        <PanelSectionHeader :count="m.routes.length > 1 ? m.routes.length : undefined">Ruta</PanelSectionHeader>
        <div class="flex flex-col" style="gap: 3px;">
          <div
            v-for="(r, i) in m.routes"
            :key="i"
            class="font-mono text-fg rounded"
            :style="{
              fontSize: '11.5px',
              padding: '5px 9px',
              background: 'var(--bg-subtle)',
              border: '1px solid var(--border-subtle)',
            }"
          >{{ r }}</div>
        </div>
      </div>
      <div>
        <PanelSectionHeader>Autenticación</PanelSectionHeader>
        <Badge :color="m.requiresAuth ? 'backend' : 'warning'">
          <Lock v-if="m.requiresAuth" :size="10" />
          <ExternalLink v-else :size="10" />
          {{ m.requiresAuth ? 'Requiere login' : 'Pública' }}
        </Badge>
      </div>
      <div v-if="m.components?.length">
        <PanelSectionHeader :count="m.components.length">Componentes</PanelSectionHeader>
        <div class="flex flex-col" style="gap: 3px;">
          <div
            v-for="(c, i) in m.components"
            :key="i"
            class="font-mono text-fg rounded"
            :style="{
              fontSize: '11.5px',
              padding: '5px 9px',
              background: 'var(--bg-subtle)',
              border: '1px solid var(--border-subtle)',
            }"
          >{{ c }}</div>
        </div>
      </div>
    </template>

    <!-- database -->
    <template v-if="kind === 'database'">
      <div>
        <PanelSectionHeader :count="dbFields.length">Esquema</PanelSectionHeader>
        <table class="w-full font-mono" style="border-collapse: collapse; font-size: 11.5px;">
          <thead>
            <tr style="border-bottom: 1px solid var(--border);">
              <th class="text-fg-subtle uppercase font-medium text-left" style="padding: 6px 0; font-size: 9.5px; letter-spacing: 0.08em;">Campo</th>
              <th class="text-fg-subtle uppercase font-medium text-left" style="padding: 6px 0; font-size: 9.5px; letter-spacing: 0.08em;">Tipo</th>
              <th class="text-fg-subtle uppercase font-medium text-right" style="padding: 6px 0; font-size: 9.5px; letter-spacing: 0.08em;">Mod</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(f, i) in dbFields" :key="i" style="border-bottom: 1px solid var(--border-subtle);">
              <td class="text-fg" :style="{ padding: '6px 0', fontWeight: f.pk ? 600 : 400 }">
                <span v-if="f.pk" class="text-accent" style="margin-right: 4px;">★</span>
                {{ f.name }}
              </td>
              <td class="text-fg-muted" style="padding: 6px 0;">{{ f.type }}</td>
              <td class="text-fg-subtle text-right" style="padding: 6px 0;">
                {{ f.pk ? 'PK' : f.fk ? 'FK' : f.unique ? 'UQ' : '' }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-if="m.relations?.length">
        <PanelSectionHeader>Relaciones</PanelSectionHeader>
        <div class="flex flex-col" style="gap: 3px;">
          <div
            v-for="(r, i) in m.relations"
            :key="i"
            class="font-mono text-fg rounded"
            :style="{
              fontSize: '11.5px',
              padding: '5px 9px',
              background: 'var(--bg-subtle)',
              border: '1px solid var(--border-subtle)',
            }"
          >{{ r.type }} → {{ r.target }} ({{ r.field }})</div>
        </div>
      </div>
    </template>

    <!-- flow -->
    <template v-if="kind === 'flow'">
      <div>
        <PanelSectionHeader>Disparador</PanelSectionHeader>
        <p class="text-fg m-0" style="font-size: 13px; line-height: 1.5;">{{ m.trigger }}</p>
      </div>
      <div>
        <PanelSectionHeader :count="m.steps.length">Pasos</PanelSectionHeader>
        <ol class="m-0 p-0 flex flex-col" style="list-style: none; gap: 6px;">
          <li
            v-for="(step, i) in m.steps"
            :key="i"
            class="flex"
            style="gap: 9px;"
          >
            <span
              class="grid place-items-center font-mono font-semibold flex-shrink-0 rounded-full bg-kind-flow-bg text-kind-flow"
              :style="{ width: '20px', height: '20px', fontSize: '10.5px' }"
            >{{ i + 1 }}</span>
            <span class="text-fg" style="font-size: 12.5px; padding-top: 2px; line-height: 1.45;">{{ step }}</span>
          </li>
        </ol>
      </div>
    </template>

    <!-- rules -->
    <template v-if="kind === 'rules'">
      <template v-for="g in ruleGroups" :key="g.label">
        <div v-if="g.items?.length">
          <PanelSectionHeader :count="g.items.length">{{ g.label }}</PanelSectionHeader>
          <ul class="text-fg flex flex-col m-0" style="padding-left: 16px; font-size: 12.5px; line-height: 1.55; gap: 4px;">
            <li v-for="(r, i) in g.items" :key="i">{{ r }}</li>
          </ul>
        </div>
      </template>
    </template>
  </div>
</template>
