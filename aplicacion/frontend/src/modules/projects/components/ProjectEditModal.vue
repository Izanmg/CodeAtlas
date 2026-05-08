<!--
  ProjectEditModal.vue

  Modal para editar el nombre y descripción de un proyecto.

  Props: open, project
  Emits: close, updated(project)
-->
<script setup>
import { ref, watch } from 'vue'
import Modal    from '@/components/ui/Modal.vue'
import Button   from '@/components/ui/Button.vue'
import Field    from '@/components/ui/Field.vue'
import Input    from '@/components/ui/Input.vue'
import Textarea from '@/components/ui/Textarea.vue'
import { useProjectsStore } from '../stores/projects.store'

const props = defineProps({
  open:    { type: Boolean, default: false },
  project: { type: Object,  default: null  },
})

const emit = defineEmits(['close', 'updated'])

const projectsStore = useProjectsStore()

const name    = ref('')
const desc    = ref('')
const saving  = ref(false)
const error   = ref('')

watch(() => props.open, (open) => {
  if (open) {
    name.value  = props.project?.name        ?? ''
    desc.value  = props.project?.description ?? ''
    saving.value = false
    error.value  = ''
  }
})

function close() {
  if (saving.value) return
  emit('close')
}

async function save() {
  if (!name.value.trim() || saving.value) return
  error.value  = ''
  saving.value = true
  try {
    const project = await projectsStore.update(props.project.id, {
      name: name.value.trim(),
      description: desc.value.trim() || null,
    })
    emit('updated', project)
    emit('close')
  } catch (err) {
    error.value = err?.data?.error ?? err.message ?? 'Error al guardar'
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <Modal :open="open" title="Editar proyecto" :width="460" @close="close">
    <div class="flex flex-col" style="gap: 14px;">
      <Field label="Nombre" htmlFor="ep-name">
        <Input
          id="ep-name"
          v-model="name"
          placeholder="Nombre del proyecto"
          autofocus
          @keydown.enter="save"
        />
      </Field>
      <Field label="Descripción" htmlFor="ep-desc" optional>
        <Textarea
          id="ep-desc"
          v-model="desc"
          placeholder="Una frase que describa el proyecto."
          :rows="3"
        />
      </Field>
      <div
        v-if="error"
        class="text-red-500 rounded"
        style="font-size: 12.5px; padding: 8px 10px; background: var(--danger-soft, #fee2e2);"
      >
        {{ error }}
      </div>
    </div>
    <template #footer>
      <Button variant="secondary" :disabled="saving" @click="close">Cancelar</Button>
      <Button
        variant="primary"
        :disabled="!name.trim() || saving"
        @click="save"
      >
        {{ saving ? 'Guardando…' : 'Guardar' }}
      </Button>
    </template>
  </Modal>
</template>
