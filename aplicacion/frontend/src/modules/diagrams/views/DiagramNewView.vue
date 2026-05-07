<!--
  DiagramNewView.vue

  Pantalla de subida de archivos `.md` para generar un diagrama nuevo.
  Soporta drag & drop, lista de archivos, botón de cargar muestra y
  estado de carga con barra de progreso por fases.
-->
<script setup>
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useDiagramsStore } from '../stores/diagrams.store'
import { useProjectsStore } from '@/modules/projects/stores/projects.store'
import AppShell from '@/components/layout/AppShell.vue'
import PageHeader from '@/components/ui/PageHeader.vue'
import Field from '@/components/ui/Field.vue'
import Input from '@/components/ui/Input.vue'
import Button from '@/components/ui/Button.vue'
import { Upload, Folder, FileText, X, Network, Loader2 } from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()
const diagramsStore = useDiagramsStore()
const projectsStore = useProjectsStore()

const projectId = route.params.id

const today = new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })
const name = ref('Arquitectura ' + today)
const files = ref([])
const dragActive = ref(false)
const state = ref('idle')          // idle | loading
const progress = ref(0)
const phaseLabel = ref('')
const inputRef = ref(null)
const folderInputRef = ref(null)

function handleFiles(fileList) {
  const arr = Array.from(fileList).filter(
    (f) => f.name.endsWith('.md') || f.name.endsWith('.markdown')
  )
  const mapped = arr.map((f) => ({
    id: f.name + Math.random(),
    name: f.name,
    size: f.size,
    file: f,
  }))
  files.value = [...files.value, ...mapped]
}

async function processEntry(entry) {
  if (entry.isFile) {
    return new Promise((resolve) => entry.file((f) => resolve([f])))
  }
  if (entry.isDirectory) {
    return new Promise((resolve) => {
      const reader = entry.createReader()
      const collected = []
      function readAll() {
        reader.readEntries(async (entries) => {
          if (!entries.length) {
            const nested = await Promise.all(collected.map(processEntry))
            resolve(nested.flat())
          } else {
            collected.push(...entries)
            readAll()
          }
        })
      }
      readAll()
    })
  }
  return []
}

async function onDrop(e) {
  e.preventDefault()
  dragActive.value = false
  const items = e.dataTransfer.items
  if (items?.length) {
    const entries = Array.from(items).map((i) => i.webkitGetAsEntry()).filter(Boolean)
    const allFiles = (await Promise.all(entries.map(processEntry))).flat()
    handleFiles(allFiles)
  } else {
    handleFiles(e.dataTransfer.files)
  }
}

function onSelectFiles(e) {
  handleFiles(e.target.files)
  e.target.value = ''
}

function removeFile(id) {
  files.value = files.value.filter((f) => f.id !== id)
}

function loadSample() {
  files.value = [
    { id: 's1', name: 'auth.md', size: 2840 },
    { id: 's2', name: 'projects.md', size: 4120 },
    { id: 's3', name: 'diagrams.md', size: 5630 },
    { id: 's4', name: 'database-schema.md', size: 1950 },
    { id: 's5', name: 'system-rules.md', size: 1280 },
  ]
}

async function generate() {
  if (!files.value.length || !name.value.trim()) return
  state.value = 'loading'
  progress.value = 0
  const diagram = await diagramsStore.generate(
    {
      projectId,
      name: name.value.trim(),
      files: files.value,
    },
    ({ progress: p, label }) => {
      progress.value = p
      phaseLabel.value = label
    }
  )
  await projectsStore.bumpDiagramCount(projectId, 1)
  router.push(`/diagrams/${diagram.id}`)
}

const breadcrumbs = ref([
  { label: 'Proyectos', to: '/' },
  { label: 'Nuevo diagrama' },
])
</script>

<template>
  <AppShell :breadcrumbs="breadcrumbs">
    <div class="px-4 sm:px-8 pt-6 sm:pt-8 pb-16" style="max-width: 760px; margin: 0 auto;">
      <PageHeader
        eyebrow="generar diagrama"
        title="Sube tu documentación"
        description="Archivos .md que describan módulos, pantallas, base de datos y flujos. Construiremos un diagrama navegable a partir de ellos."
      />

      <!-- Estado de carga -->
      <div
        v-if="state === 'loading'"
        class="bg-surface rounded-lg text-center"
        :style="{ padding: '48px 32px', border: '1px solid var(--border)' }"
      >
        <div
          class="grid place-items-center bg-accent-soft text-accent rounded-md"
          :style="{ width: '44px', height: '44px', margin: '0 auto 18px' }"
        >
          <Loader2 :size="20" :stroke-width="2" class="animate-spin-loader" />
        </div>
        <div
          class="text-fg font-semibold"
          :style="{ fontSize: '16px', letterSpacing: '-0.01em' }"
        >{{ phaseLabel || 'Procesando…' }}</div>
        <div class="text-fg-subtle" :style="{ margin: '4px 0 20px', fontSize: '12.5px' }">
          {{ files.length }} {{ files.length === 1 ? 'archivo' : 'archivos' }}
        </div>
        <div
          class="bg-bg-muted rounded overflow-hidden mx-auto"
          :style="{ width: '320px', maxWidth: '100%', height: '3px' }"
        >
          <div
            class="bg-accent h-full"
            :style="{
              width: progress + '%',
              transition: 'width 350ms cubic-bezier(0.4, 0, 0.2, 1)',
            }"
          />
        </div>
        <div
          class="font-mono text-fg-faint"
          :style="{ marginTop: '8px', fontSize: '10.5px', letterSpacing: '0.06em' }"
        >{{ progress }}%</div>
      </div>

      <!-- Formulario -->
      <div v-else class="flex flex-col" style="gap: 16px;">
        <div
          class="rounded-lg text-center transition-colors duration-100"
          :style="{
            padding: '44px 24px',
            border: `1.5px dashed ${dragActive ? 'var(--accent)' : 'var(--border-strong)'}`,
            background: dragActive ? 'var(--accent-soft)' : 'var(--surface)',
          }"
          @dragenter.prevent="dragActive = true"
          @dragleave.prevent="dragActive = false"
          @dragover.prevent
          @drop="onDrop"
        >
          <div
            class="grid place-items-center mx-auto rounded-md"
            :style="{
              width: '40px',
              height: '40px',
              marginBottom: '12px',
              background: dragActive ? 'var(--accent)' : 'var(--bg-muted)',
              color: dragActive ? 'var(--accent-fg)' : 'var(--fg-muted)',
              transition: 'background 120ms, color 120ms',
            }"
          >
            <Upload :size="18" />
          </div>
          <div
            class="text-fg font-semibold"
            :style="{ fontSize: '14px', letterSpacing: '-0.01em' }"
          >Arrastra archivos o carpetas .md aquí</div>
          <div class="text-fg-subtle" :style="{ margin: '4px 0 14px', fontSize: '12.5px' }">
            o selecciónalos con los botones · acepta varios archivos y carpetas
          </div>
          <div class="flex" style="gap: 8px; justify-content: center;">
            <Button variant="secondary" size="sm" @click.stop="inputRef?.click()">
              <template #icon><FileText :size="13" /></template>
              Archivos
            </Button>
            <Button variant="secondary" size="sm" @click.stop="folderInputRef?.click()">
              <template #icon><Folder :size="13" /></template>
              Carpeta
            </Button>
          </div>
          <input
            ref="inputRef"
            type="file"
            accept=".md,.markdown"
            multiple
            style="display: none;"
            @change="onSelectFiles"
          />
          <input
            ref="folderInputRef"
            type="file"
            webkitdirectory
            multiple
            style="display: none;"
            @change="onSelectFiles"
          />
        </div>

        <div
          v-if="files.length > 0"
          class="bg-surface rounded-md overflow-hidden"
          :style="{ border: '1px solid var(--border)' }"
        >
          <div
            class="flex justify-between items-center bg-bg-subtle"
            :style="{
              padding: '8px 12px',
              borderBottom: '1px solid var(--border-subtle)',
            }"
          >
            <span
              class="font-mono text-fg-subtle uppercase"
              :style="{ fontSize: '11.5px', letterSpacing: '0.04em' }"
            >
              {{ files.length }} {{ files.length === 1 ? 'archivo' : 'archivos' }}
            </span>
            <button
              class="text-fg-subtle"
              :style="{ fontSize: '11.5px', padding: '2px' }"
              @click="files = []"
            >Quitar todos</button>
          </div>
          <div
            v-for="(f, i) in files"
            :key="f.id"
            class="flex items-center"
            :style="{
              padding: '8px 12px',
              gap: '10px',
              borderTop: i > 0 ? '1px solid var(--border-subtle)' : 'none',
            }"
          >
            <FileText :size="13" class="text-fg-faint" />
            <span class="font-mono text-fg flex-1" style="font-size: 12px;">{{ f.name }}</span>
            <span class="font-mono text-fg-subtle" style="font-size: 11px;">
              {{ (f.size / 1024).toFixed(1) }} KB
            </span>
            <button
              class="text-fg-faint grid place-items-center rounded"
              style="padding: 4px;"
              @click="removeFile(f.id)"
            >
              <X :size="12" />
            </button>
          </div>
        </div>

        <Field label="Nombre del diagrama" htmlFor="dn-name">
          <Input id="dn-name" v-model="name" placeholder="ej. Arquitectura general" />
        </Field>

        <div
          class="flex flex-col sm:flex-row justify-between items-start sm:items-center"
          :style="{
            paddingTop: '8px',
            borderTop: '1px solid var(--border-subtle)',
            marginTop: '8px',
            gap: '12px',
          }"
        >
          <button
            class="font-mono text-fg-subtle"
            :style="{ fontSize: '11.5px', letterSpacing: '0.02em', padding: '4px 0' }"
            @click="loadSample"
          >↳ cargar muestra</button>
          <div class="flex" style="gap: 8px;">
            <Button variant="ghost" @click="router.back()">Cancelar</Button>
            <Button
              variant="primary"
              :disabled="files.length === 0 || !name.trim()"
              @click="generate"
            >
              <template #icon><Network :size="14" /></template>
              Generar diagrama
            </Button>
          </div>
        </div>
      </div>
    </div>
  </AppShell>
</template>
