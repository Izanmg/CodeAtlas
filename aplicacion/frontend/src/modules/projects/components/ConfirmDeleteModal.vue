<!--
  ConfirmDeleteModal.vue

  Modal de confirmación para borrar un recurso.
  Props: open, title, description, loading.
  Emits: close, confirm.
-->
<script setup>
import Modal from '@/components/ui/Modal.vue'
import Button from '@/components/ui/Button.vue'
import { Trash2 } from 'lucide-vue-next'

defineProps({
  open:        { type: Boolean, default: false },
  title:       { type: String,  default: 'Confirmar borrado' },
  description: { type: String,  default: '¿Estás seguro? Esta acción no se puede deshacer.' },
  loading:     { type: Boolean, default: false },
})

defineEmits(['close', 'confirm'])
</script>

<template>
  <Modal :open="open" :title="title" :width="400" @close="$emit('close')">
    <p class="text-fg-muted m-0" style="font-size: 13.5px; line-height: 1.65;">
      {{ description }}
    </p>
    <template #footer>
      <Button variant="secondary" :disabled="loading" @click="$emit('close')">
        Cancelar
      </Button>
      <Button variant="danger-solid" :disabled="loading" @click="$emit('confirm')">
        <template #icon><Trash2 :size="13" /></template>
        {{ loading ? 'Borrando…' : 'Borrar' }}
      </Button>
    </template>
  </Modal>
</template>
