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
import { computed, ref, watch } from 'vue'
import PanelSectionHeader from './PanelSectionHeader.vue'
import Badge from '@/components/ui/Badge.vue'
import { Lock, ExternalLink, ChevronRight, Folder, FileText } from 'lucide-vue-next'

const props = defineProps({
  node: { type: Object, required: true },
  m: { type: Object, required: true },
  model: { type: Object, required: true },
})

const kind = computed(() => props.node.data.kind)

// Árbol de archivos del módulo: agrupa los files por folder y adjunta las
// funciones declaradas en m.functions[fileId]. Los files sin folder caen
// en `rootFiles` (carpeta raíz del módulo).
const fileTree = computed(() => {
  const folders = props.m.folders ?? []
  const files = props.m.files ?? []
  const functions = props.m.functions ?? {}

  const byFolder = new Map()
  for (const f of folders) byFolder.set(f.id, { folder: f, files: [] })

  const rootFiles = []
  for (const file of files) {
    const enriched = { ...file, functions: functions[file.id] ?? [] }
    if (file.folder && byFolder.has(file.folder)) {
      byFolder.get(file.folder).files.push(enriched)
    } else {
      rootFiles.push(enriched)
    }
  }

  return {
    folders: Array.from(byFolder.values()),
    rootFiles,
  }
})

const hasFileTree = computed(() =>
  (props.m.folders?.length || 0) > 0 || (props.m.files?.length || 0) > 0
)

const fileTreeCount = computed(() =>
  (props.m.files?.length || 0)
)

// Estados de despliegue independientes por folder y por file.
const openFolders = ref(new Set())
const openFiles = ref(new Set())

function toggleFolder(id) {
  const next = new Set(openFolders.value)
  if (next.has(id)) next.delete(id)
  else next.add(id)
  openFolders.value = next
}

function toggleFile(id) {
  const next = new Set(openFiles.value)
  if (next.has(id)) next.delete(id)
  else next.add(id)
  openFiles.value = next
}

// Cada función puede llegar como string (formato antiguo) o como objeto
// { signature, doc } (formato nuevo con `doc:` indentado). Normalizamos.
function fnSignature(fn) {
  return typeof fn === 'string' ? fn : fn.signature
}
function fnDoc(fn) {
  return typeof fn === 'string' ? null : fn.doc
}

// Estado de despliegue por función (en el detalle de un archivo del
// deep-dive). Reset al cambiar de nodo.
const openFileFns = ref(new Set())
function toggleFileFn(idx) {
  const next = new Set(openFileFns.value)
  if (next.has(idx)) next.delete(idx)
  else next.add(idx)
  openFileFns.value = next
}
watch(() => props.node.id, () => {
  openFileFns.value = new Set()
})

// Reset al cambiar de nodo: cada módulo arranca con todo colapsado.
watch(() => props.node.id, () => {
  openFolders.value = new Set()
  openFiles.value = new Set()
})

const screens = computed(() => {
  if (kind.value !== 'frontend') return []
  return (props.m.screens || [])
    .map((id) => props.model.screens.find((s) => s.id === id))
    .filter(Boolean)
})

const ruleGroups = computed(() => [
  { label: 'Autenticación',     items: props.m.auth },
  { label: 'Navegación',        items: props.m.navigation },
  { label: 'Validación',        items: props.m.validation },
  { label: 'Convenciones',      items: props.m.conventions },
  { label: 'Decisiones técnicas', items: props.m.technicalDecisions },
])

// Pares (clave → texto) de las secciones libres del usuario.
const extensionEntries = computed(() => {
  const ext = props.m.extensions
  if (!ext || typeof ext !== 'object') return []
  return Object.entries(ext).filter(([, v]) => v != null && String(v).trim() !== '')
})

function formatTitle(key) {
  return key
    .split(/[\s_-]+/)
    .filter(Boolean)
    .map((w) => w[0].toUpperCase() + w.slice(1))
    .join(' ')
}

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

    <!-- archivos (backend + frontend) -->
    <template v-if="(kind === 'backend' || kind === 'frontend') && hasFileTree">
      <div>
        <PanelSectionHeader :count="fileTreeCount">Archivos</PanelSectionHeader>
        <div
          class="flex flex-col rounded overflow-hidden"
          :style="{ border: '1px solid var(--border-subtle)', background: 'var(--bg-subtle)' }"
        >
          <!-- Carpetas -->
          <template v-for="(group, gi) in fileTree.folders" :key="group.folder.id">
            <button
              class="w-full flex items-center text-left hover:bg-bg-muted transition-colors duration-100"
              :style="{
                padding: '6px 9px',
                gap: '6px',
                fontSize: '12px',
                borderTop: gi > 0 ? '1px solid var(--border-subtle)' : 'none',
              }"
              @click="toggleFolder(group.folder.id)"
            >
              <ChevronRight
                :size="11"
                class="text-fg-faint transition-transform duration-150 flex-shrink-0"
                :style="{ transform: openFolders.has(group.folder.id) ? 'rotate(90deg)' : 'none' }"
              />
              <Folder :size="12" class="text-fg-muted flex-shrink-0" />
              <span class="text-fg font-medium flex-1 truncate font-mono" style="font-size: 11.5px;">
                {{ group.folder.id }}
              </span>
              <span class="font-mono text-fg-faint" style="font-size: 10px;">
                {{ group.files.length }}
              </span>
            </button>

            <!-- Archivos de la carpeta -->
            <template v-if="openFolders.has(group.folder.id)">
              <template v-for="file in group.files" :key="file.id">
                <button
                  class="w-full flex items-center text-left hover:bg-bg-muted transition-colors duration-100"
                  :style="{
                    padding: '5px 9px 5px 30px',
                    gap: '6px',
                    fontSize: '11.5px',
                    borderTop: '1px solid var(--border-subtle)',
                    cursor: file.functions.length ? 'pointer' : 'default',
                  }"
                  @click="file.functions.length && toggleFile(file.id)"
                >
                  <ChevronRight
                    v-if="file.functions.length"
                    :size="10"
                    class="text-fg-faint transition-transform duration-150 flex-shrink-0"
                    :style="{ transform: openFiles.has(file.id) ? 'rotate(90deg)' : 'none' }"
                  />
                  <span v-else style="width: 10px; flex-shrink: 0;" />
                  <FileText :size="11" class="text-fg-faint flex-shrink-0" />
                  <span class="text-fg flex-1 truncate font-mono">{{ file.path }}</span>
                  <span
                    v-if="file.type"
                    class="font-mono uppercase text-fg-faint"
                    :style="{ fontSize: '9px', letterSpacing: '0.06em' }"
                  >{{ file.type }}</span>
                </button>

                <!-- Funciones del archivo -->
                <template v-if="openFiles.has(file.id)">
                  <template v-for="(fn, fi) in file.functions" :key="fi">
                    <div
                      class="text-fg-muted font-mono"
                      :style="{
                        padding: '3px 9px 3px 52px',
                        fontSize: '11px',
                        lineHeight: '1.5',
                        borderTop: '1px solid var(--border-subtle)',
                        background: 'var(--bg)',
                      }"
                    >
                      <span class="text-fg-faint" style="margin-right: 4px;">›</span>{{ fnSignature(fn) }}
                    </div>
                    <div
                      v-if="fnDoc(fn)"
                      class="text-fg-faint"
                      :style="{
                        padding: '2px 9px 6px 62px',
                        fontSize: '10.5px',
                        lineHeight: '1.5',
                        background: 'var(--bg)',
                        whiteSpace: 'pre-wrap',
                      }"
                    >{{ fnDoc(fn) }}</div>
                  </template>
                </template>
              </template>
              <div
                v-if="!group.files.length"
                class="text-fg-faint font-mono italic"
                :style="{ padding: '5px 9px 5px 30px', fontSize: '10.5px', borderTop: '1px solid var(--border-subtle)' }"
              >
                vacía
              </div>
            </template>
          </template>

          <!-- Archivos en la raíz del módulo (sin carpeta) -->
          <template v-for="(file, fi) in fileTree.rootFiles" :key="file.id">
            <button
              class="w-full flex items-center text-left hover:bg-bg-muted transition-colors duration-100"
              :style="{
                padding: '5px 9px',
                gap: '6px',
                fontSize: '11.5px',
                borderTop: (fileTree.folders.length || fi > 0) ? '1px solid var(--border-subtle)' : 'none',
                cursor: file.functions.length ? 'pointer' : 'default',
              }"
              @click="file.functions.length && toggleFile(file.id)"
            >
              <ChevronRight
                v-if="file.functions.length"
                :size="10"
                class="text-fg-faint transition-transform duration-150 flex-shrink-0"
                :style="{ transform: openFiles.has(file.id) ? 'rotate(90deg)' : 'none' }"
              />
              <span v-else style="width: 10px; flex-shrink: 0;" />
              <FileText :size="11" class="text-fg-faint flex-shrink-0" />
              <span class="text-fg flex-1 truncate font-mono">{{ file.path }}</span>
              <span
                v-if="file.type"
                class="font-mono uppercase text-fg-faint"
                :style="{ fontSize: '9px', letterSpacing: '0.06em' }"
              >{{ file.type }}</span>
            </button>

            <template v-if="openFiles.has(file.id)">
              <template v-for="(fn, fni) in file.functions" :key="fni">
                <div
                  class="text-fg-muted font-mono"
                  :style="{
                    padding: '3px 9px 3px 31px',
                    fontSize: '11px',
                    lineHeight: '1.5',
                    borderTop: '1px solid var(--border-subtle)',
                    background: 'var(--bg)',
                  }"
                >
                  <span class="text-fg-faint" style="margin-right: 4px;">›</span>{{ fnSignature(fn) }}
                </div>
                <div
                  v-if="fnDoc(fn)"
                  class="text-fg-faint"
                  :style="{
                    padding: '2px 9px 6px 41px',
                    fontSize: '10.5px',
                    lineHeight: '1.5',
                    background: 'var(--bg)',
                    whiteSpace: 'pre-wrap',
                  }"
                >{{ fnDoc(fn) }}</div>
              </template>
            </template>
          </template>
        </div>
      </div>
    </template>

    <!-- modules: state (frontend), purpose, notes (backend + frontend) -->
    <template v-if="kind === 'frontend' && m.state?.length">
      <div>
        <PanelSectionHeader :count="m.state.length">Estado</PanelSectionHeader>
        <div class="flex flex-col" style="gap: 3px;">
          <div
            v-for="(s, i) in m.state"
            :key="i"
            class="font-mono text-fg rounded"
            :style="{
              fontSize: '11.5px',
              padding: '5px 9px',
              background: 'var(--bg-subtle)',
              border: '1px solid var(--border-subtle)',
            }"
          >{{ s }}</div>
        </div>
      </div>
    </template>

    <template v-if="(kind === 'backend' || kind === 'frontend') && m.purpose">
      <div>
        <PanelSectionHeader>Descripción</PanelSectionHeader>
        <div
          class="text-fg rounded"
          :style="{
            fontSize: '12.5px',
            lineHeight: '1.6',
            padding: '9px 11px',
            background: 'var(--bg-subtle)',
            border: '1px solid var(--border-subtle)',
            whiteSpace: 'pre-wrap',
          }"
        >{{ m.purpose }}</div>
      </div>
    </template>

    <template v-if="(kind === 'backend' || kind === 'frontend') && m.notes">
      <div>
        <PanelSectionHeader>Notas</PanelSectionHeader>
        <div
          class="text-fg rounded"
          :style="{
            fontSize: '12.5px',
            lineHeight: '1.6',
            padding: '9px 11px',
            background: 'var(--bg-subtle)',
            border: '1px solid var(--border-subtle)',
            whiteSpace: 'pre-wrap',
          }"
        >{{ m.notes }}</div>
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
      <div v-if="m.folder || m.file">
        <PanelSectionHeader>Implementación</PanelSectionHeader>
        <div
          class="flex items-center font-mono text-fg rounded"
          :style="{
            fontSize: '11.5px',
            padding: '6px 10px',
            background: 'var(--bg-subtle)',
            border: '1px solid var(--border-subtle)',
            gap: '8px',
          }"
        >
          <span v-if="m.folder" class="text-fg-muted">📁 {{ m.folder }}</span>
          <span v-if="m.folder && m.file" class="text-fg-faint">/</span>
          <span v-if="m.file">📄 {{ m.file }}</span>
        </div>
      </div>
      <div v-if="m.fullDescription">
        <PanelSectionHeader>Descripción</PanelSectionHeader>
        <div
          class="text-fg rounded"
          :style="{
            fontSize: '12.5px',
            lineHeight: '1.6',
            padding: '9px 11px',
            background: 'var(--bg-subtle)',
            border: '1px solid var(--border-subtle)',
            whiteSpace: 'pre-wrap',
          }"
        >{{ m.fullDescription }}</div>
      </div>
      <div v-if="m.elements?.length">
        <PanelSectionHeader :count="m.elements.length">Elementos</PanelSectionHeader>
        <ul
          class="text-fg flex flex-col m-0"
          style="padding-left: 16px; font-size: 12.5px; line-height: 1.55; gap: 4px;"
        >
          <li v-for="(it, i) in m.elements" :key="i">{{ it }}</li>
        </ul>
      </div>
      <div v-if="m.actions?.length">
        <PanelSectionHeader :count="m.actions.length">Acciones</PanelSectionHeader>
        <div class="flex flex-col" style="gap: 3px;">
          <div
            v-for="(a, i) in m.actions"
            :key="i"
            class="font-mono text-fg rounded"
            :style="{
              fontSize: '11.5px',
              padding: '5px 9px',
              background: 'var(--bg-subtle)',
              border: '1px solid var(--border-subtle)',
            }"
          >{{ a }}</div>
        </div>
      </div>
      <div v-if="m.states?.length">
        <PanelSectionHeader :count="m.states.length">Estados</PanelSectionHeader>
        <div class="flex" style="gap: 4px; flex-wrap: wrap;">
          <span
            v-for="(s, i) in m.states"
            :key="i"
            class="font-mono uppercase text-fg-muted rounded"
            :style="{
              fontSize: '10px',
              letterSpacing: '0.06em',
              padding: '3px 8px',
              background: 'var(--bg-muted)',
              border: '1px solid var(--border-subtle)',
            }"
          >{{ s }}</span>
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
          >{{ r.type }} → {{ r.target }}<template v-if="r.field || r.sourceField"> ({{ r.field || r.sourceField }})</template></div>
        </div>
      </div>
      <div v-if="m.notes">
        <PanelSectionHeader>Notas</PanelSectionHeader>
        <div
          class="text-fg rounded"
          :style="{
            fontSize: '12.5px',
            lineHeight: '1.6',
            padding: '9px 11px',
            background: 'var(--bg-subtle)',
            border: '1px solid var(--border-subtle)',
            whiteSpace: 'pre-wrap',
          }"
        >{{ m.notes }}</div>
      </div>
    </template>

    <!-- file (deep-dive de un módulo) -->
    <template v-if="kind === 'file'">
      <div v-if="m.role">
        <PanelSectionHeader>Rol</PanelSectionHeader>
        <div
          class="text-fg rounded"
          :style="{
            fontSize: '12.5px',
            lineHeight: '1.6',
            padding: '9px 11px',
            background: 'var(--bg-subtle)',
            border: '1px solid var(--border-subtle)',
            whiteSpace: 'pre-wrap',
          }"
        >{{ m.role }}</div>
      </div>

      <div v-if="m.folderPath || m.type">
        <PanelSectionHeader>Metadata</PanelSectionHeader>
        <div class="flex flex-col" style="gap: 4px;">
          <div
            v-if="m.folderPath"
            class="flex items-center font-mono rounded"
            :style="{
              padding: '5px 9px',
              background: 'var(--bg-subtle)',
              border: '1px solid var(--border-subtle)',
              fontSize: '11px',
              gap: '8px',
            }"
          >
            <span class="text-fg-faint uppercase" style="font-size: 9px; letter-spacing: 0.06em;">carpeta</span>
            <span class="text-fg flex-1 truncate">{{ m.folderPath }}</span>
          </div>
          <div
            v-if="m.type"
            class="flex items-center font-mono rounded"
            :style="{
              padding: '5px 9px',
              background: 'var(--bg-subtle)',
              border: '1px solid var(--border-subtle)',
              fontSize: '11px',
              gap: '8px',
            }"
          >
            <span class="text-fg-faint uppercase" style="font-size: 9px; letter-spacing: 0.06em;">tipo</span>
            <span class="text-fg flex-1">{{ m.type }}</span>
          </div>
        </div>
      </div>

      <div v-if="m.imports?.length">
        <PanelSectionHeader :count="m.imports.length">Imports</PanelSectionHeader>
        <div class="flex flex-col" style="gap: 3px;">
          <div
            v-for="imp in m.imports"
            :key="imp"
            class="font-mono text-fg rounded"
            :style="{
              fontSize: '11.5px',
              padding: '5px 9px',
              background: 'var(--bg-subtle)',
              border: '1px solid var(--border-subtle)',
            }"
          >{{ imp }}</div>
        </div>
      </div>

      <div v-if="m.functions?.length">
        <PanelSectionHeader :count="m.functions.length">Funciones</PanelSectionHeader>
        <div
          class="flex flex-col rounded overflow-hidden"
          :style="{ border: '1px solid var(--border-subtle)' }"
        >
          <template v-for="(fn, i) in m.functions" :key="i">
            <button
              class="w-full flex items-center text-left transition-colors duration-100"
              :style="{
                padding: '7px 10px',
                fontSize: '12px',
                fontFamily: 'monospace',
                borderTop: i > 0 ? '1px solid var(--border-subtle)' : 'none',
                background: openFileFns.has(i) ? 'var(--bg-muted)' : 'var(--bg-subtle)',
                color: 'var(--fg)',
                cursor: fnDoc(fn) ? 'pointer' : 'default',
                gap: '6px',
              }"
              @click="fnDoc(fn) && toggleFileFn(i)"
            >
              <span
                v-if="fnDoc(fn)"
                class="text-fg-faint flex-shrink-0 transition-transform duration-150"
                :style="{
                  transform: openFileFns.has(i) ? 'rotate(90deg)' : 'none',
                  display: 'inline-block',
                  width: '10px',
                }"
              >▸</span>
              <span v-else class="text-fg-faint flex-shrink-0" style="width: 10px;">›</span>
              <span class="flex-1 truncate">{{ fnSignature(fn) }}</span>
            </button>
            <div
              v-if="fnDoc(fn) && openFileFns.has(i)"
              class="text-fg-muted"
              :style="{
                padding: '8px 12px 10px 26px',
                fontSize: '12px',
                lineHeight: '1.55',
                background: 'var(--bg-muted)',
                borderTop: '1px solid var(--border-subtle)',
                whiteSpace: 'pre-wrap',
              }"
            >
              {{ fnDoc(fn) }}
            </div>
          </template>
        </div>
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

    <!-- otras secciones (extensiones libres del usuario, válido para cualquier tipo) -->
    <template v-if="extensionEntries.length">
      <div
        v-for="[key, content] in extensionEntries"
        :key="key"
      >
        <PanelSectionHeader>{{ formatTitle(key) }}</PanelSectionHeader>
        <div
          class="text-fg rounded"
          :style="{
            fontSize: '12.5px',
            lineHeight: '1.6',
            padding: '9px 11px',
            background: 'var(--bg-subtle)',
            border: '1px solid var(--border-subtle)',
            whiteSpace: 'pre-wrap',
          }"
        >{{ content }}</div>
      </div>
    </template>
  </div>
</template>
