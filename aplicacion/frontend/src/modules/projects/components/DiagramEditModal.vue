<!--
  DiagramEditModal.vue

  Modal para editar un diagrama: renombrar y/o subir nuevos archivos .md
  para regenerar el modelo.

  Props: open, diagram
  Emits: close, updated(diagram)
-->
<script setup>
import { ref, watch } from 'vue'
import Modal  from '@/components/ui/Modal.vue'
import Button from '@/components/ui/Button.vue'
import Field  from '@/components/ui/Field.vue'
import Input  from '@/components/ui/Input.vue'
import { useDiagramsStore } from '@/modules/diagrams/stores/diagrams.store'
import { Upload, FileText, Folder, X, Loader2, RefreshCw } from 'lucide-vue-next'

const props = defineProps({
  open:    { type: Boolean, default: false },
  diagram: { type: Object,  default: null  },
})

const emit = defineEmits(['close', 'updated'])

const diagramsStore = useDiagramsStore()

const name      = ref('')
const files     = ref([])
const dragActive = ref(false)
const state     = ref('idle')   // 'idle' | 'loading'
const progress  = ref(0)
const phaseLabel = ref('')
const error     = ref('')

const inputRef       = ref(null)
const folderInputRef = ref(null)

// Pre-fill name when modal opens
watch(() => props.open, (open) => {
  if (open) {
    name.value = props.diagram?.name ?? ''
    files.value = []
    state.value = 'idle'
    progress.value = 0
    error.value = ''
  }
})

function addFiles(fileList) {
  const mdFiles = Array.from(fileList).filter(
    (f) => f.name.endsWith('.md') || f.name.endsWith('.markdown')
  )
  for (const f of mdFiles) {
    if (!files.value.find((x) => x.name === f.name)) {
      files.value.push({ id: `${f.name}-${f.lastModified}`, name: f.name, size: f.size, file: f })
    }
  }
}

function onSelectFiles(e) {
  addFiles(e.target.files)
  e.target.value = ''
}

function onDrop(e) {
  e.preventDefault()
  dragActive.value = false
  const items = e.dataTransfer?.items ?? []
  const dropped = []
  for (const item of items) {
    const entry = item.webkitGetAsEntry?.()
    if (entry?.isFile) entry.file((f) => dropped.push(f))
    else if (entry?.isDirectory) {
      const reader = entry.createReader()
      reader.readEntries((entries) => {
        entries.forEach((en) => en.isFile && en.file((f) => dropped.push(f)))
      })
    }
  }
  setTimeout(() => addFiles(dropped), 100)
}

function removeFile(id) {
  files.value = files.value.filter((f) => f.id !== id)
}

function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} B`
  return `${(bytes / 1024).toFixed(1)} KB`
}

function close() {
  if (state.value === 'loading') return
  emit('close')
}

async function save() {
  if (!name.value.trim() || state.value === 'loading') return
  error.value = ''
  state.value = 'loading'
  progress.value = 0

  try {
    const diagram = await diagramsStore.update(
      props.diagram.id,
      { name: name.value.trim(), files: files.value },
      ({ progress: p, label }) => {
        progress.value = p
        phaseLabel.value = label
      }
    )
    emit('updated', diagram)
    emit('close')
  } catch (err) {
    error.value = err?.data?.error ?? err.message ?? 'Error al guardar'
    state.value = 'idle'
  }
}
</script>

<template>
  <Modal :open="open" title="Editar diagrama" :width="520" @close="close">
    <div style="max-height: 65vh; overflow-y: auto; margin: -18px; padding: 18px;">

    <!-- Loading state -->
    <div
      v-if="state === 'loading'"
      class="text-center"
      style="padding: 24px 0;"
    >
      <div
        class="grid place-items-center bg-accent-soft text-accent rounded-md mx-auto"
        :style="{ width: '40px', height: '40px', marginBottom: '14px' }"
      >
        <Loader2 :size="18" :stroke-width="2" class="animate-spin-loader" />
      </div>
      <div class="text-fg font-semibold" style="font-size: 14px;">
        {{ phaseLabel || 'Guardando…' }}
      </div>
      <div class="text-fg-subtle" style="margin: 3px 0 16px; font-size: 12.5px;">
        {{ files.length ? `${files.length} archivo${files.length > 1 ? 's' : ''}` : diagram?.name }}
      </div>
      <div
        class="bg-bg-muted rounded overflow-hidden mx-auto"
        style="width: 280px; height: 3px;"
      >
        <div
          class="bg-accent h-full"
          :style="{ width: progress + '%', transition: 'width 350ms cubic-bezier(0.4,0,0.2,1)' }"
        />
      </div>
    </div>

    <!-- Form -->
    <div v-else class="flex flex-col" style="gap: 16px;">
      <Field label="Nombre" htmlFor="edit-name">
        <Input
          id="edit-name"
          v-model="name"
          placeholder="Nombre del diagrama"
          autofocus
          @keydown.enter="save"
        />
      </Field>

      <!-- File upload zone -->
      <div>
        <div
          class="text-fg-subtle font-medium"
          style="font-size: 11.5px; letter-spacing: 0.04em; text-transform: uppercase; margin-bottom: 8px;"
        >
          Actualizar archivos <span style="font-weight: 400; color: var(--fg-faint);">(opcional)</span>
        </div>

        <div
          class="rounded-lg text-center transition-colors duration-100"
          :style="{
            padding: '28px 20px',
            border: `1.5px dashed ${dragActive ? 'var(--accent)' : 'var(--border-strong)'}`,
            background: dragActive ? 'var(--accent-soft)' : 'var(--bg-subtle)',
          }"
          @dragenter.prevent="dragActive = true"
          @dragleave.prevent="dragActive = false"
          @dragover.prevent
          @drop="onDrop"
        >
          <div
            class="grid place-items-center mx-auto rounded-md"
            :style="{
              width: '36px', height: '36px', marginBottom: '10px',
              background: dragActive ? 'var(--accent)' : 'var(--bg-muted)',
              color: dragActive ? 'var(--accent-fg)' : 'var(--fg-muted)',
              transition: 'background 120ms, color 120ms',
            }"
          >
            <Upload :size="16" />
          </div>
          <div class="text-fg font-semibold" style="font-size: 13px;">
            Arrastra archivos .md aquí
          </div>
          <div class="text-fg-subtle" style="margin: 3px 0 12px; font-size: 12px;">
            Si subes archivos se regenerará el diagrama completo
          </div>
          <div class="flex" style="gap: 8px; justify-content: center;">
            <Button variant="secondary" size="sm" @click.stop="inputRef?.click()">
              <template #icon><FileText :size="12" /></template>
              Archivos
            </Button>
            <Button variant="secondary" size="sm" @click.stop="folderInputRef?.click()">
              <template #icon><Folder :size="12" /></template>
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
            accept=".md,.markdown"
            multiple
            webkitdirectory
            style="display: none;"
            @change="onSelectFiles"
          />
        </div>

        <!-- File list -->
        <div v-if="files.length" class="flex flex-col" style="gap: 4px; margin-top: 8px;">
          <div
            v-for="f in files"
            :key="f.id"
            class="flex items-center rounded"
            :style="{
              padding: '6px 10px',
              background: 'var(--bg-subtle)',
              border: '1px solid var(--border-subtle)',
              gap: '8px',
              fontSize: '12px',
            }"
          >
            <FileText :size="12" class="text-fg-muted flex-shrink-0" />
            <span class="text-fg flex-1 truncate" style="font-family: monospace;">{{ f.name }}</span>
            <span class="text-fg-faint" style="font-size: 10.5px; font-family: monospace;">{{ formatSize(f.size) }}</span>
            <button
              class="text-fg-faint hover:text-fg-muted grid place-items-center"
              style="padding: 2px;"
              @click="removeFile(f.id)"
            >
              <X :size="11" />
            </button>
          </div>
        </div>

        <!-- Regenerate badge -->
        <div
          v-if="files.length"
          class="flex items-center rounded"
          style="gap: 6px; margin-top: 8px; padding: 7px 10px; background: var(--accent-soft); color: var(--accent); font-size: 12px;"
        >
          <RefreshCw :size="12" />
          <span>El diagrama se regenerará con estos archivos al guardar</span>
        </div>
      </div>

      <!-- Error -->
      <div
        v-if="error"
        class="text-red-500 rounded"
        style="font-size: 12.5px; padding: 8px 10px; background: var(--danger-soft, #fee2e2);"
      >
        {{ error }}
      </div>
    </div>

    </div><!-- /scroll wrapper -->

    <template #footer>
      <Button variant="secondary" :disabled="state === 'loading'" @click="close">
        Cancelar
      </Button>
      <Button
        variant="primary"
        :disabled="!name.trim() || state === 'loading'"
        @click="save"
      >
        <template v-if="files.length" #icon><RefreshCw :size="13" /></template>
        {{ files.length ? 'Regenerar y guardar' : 'Guardar' }}
      </Button>
    </template>
  </Modal>
</template>
