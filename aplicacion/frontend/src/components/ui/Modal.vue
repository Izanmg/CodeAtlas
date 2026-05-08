<!--
  Modal.vue

  Diálogo modal. Cierra al hacer clic fuera o con el botón ✕ del header.
  Slot por defecto = cuerpo. Slot `footer` = fila de acciones.
-->
<script setup>
import { ref } from 'vue'
import { X } from 'lucide-vue-next'

defineProps({
  open: { type: Boolean, default: false },
  title: { type: String, default: '' },
  width: { type: Number, default: 480 },
})

const emit = defineEmits(['close'])

const mousedownOnBackdrop = ref(false)

function onBackdropMousedown(e) {
  mousedownOnBackdrop.value = e.target === e.currentTarget
}

function onBackdropMouseup(e) {
  if (mousedownOnBackdrop.value && e.target === e.currentTarget) {
    emit('close')
  }
  mousedownOnBackdrop.value = false
}
</script>

<template>
  <Teleport to="body">
    <div
      v-if="open"
      class="fixed inset-0 z-[100] grid place-items-center"
      style="background: rgba(9, 9, 11, 0.5); backdrop-filter: blur(2px); animation: ca-fade 120ms ease-out;"
      @mousedown="onBackdropMousedown"
      @mouseup="onBackdropMouseup"
    >
      <div
        class="bg-surface-overlay rounded-lg shadow-xl"
        :style="{
          width: width + 'px',
          maxWidth: 'calc(100vw - 32px)',
          border: '1px solid var(--border)',
          animation: 'ca-scale-in 140ms cubic-bezier(0.2,0.8,0.2,1)',
        }"
      >
        <div
          class="flex items-center justify-between"
          style="padding: 14px 18px; border-bottom: 1px solid var(--border-subtle);"
        >
          <div
            class="font-semibold text-fg"
            style="font-size: 14px; letter-spacing: -0.01em;"
          >
            {{ title }}
          </div>
          <button
            class="text-fg-muted grid place-items-center rounded"
            style="padding: 4px;"
            @click="$emit('close')"
          >
            <X :size="15" />
          </button>
        </div>
        <div style="padding: 18px;">
          <slot />
        </div>
        <div
          v-if="$slots.footer"
          class="flex justify-end"
          style="padding: 12px 18px; border-top: 1px solid var(--border-subtle); gap: 8px;"
        >
          <slot name="footer" />
        </div>
      </div>
    </div>
  </Teleport>
</template>
