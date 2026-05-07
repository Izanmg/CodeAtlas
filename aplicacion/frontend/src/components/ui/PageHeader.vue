<!--
  PageHeader.vue

  Cabecera estándar de cada vista. Compone:
    - Eyebrow (texto pequeño en mono mayúsculas)
    - h1 con el título
    - Descripción opcional
    - Slot de acciones a la derecha
-->
<script setup>
defineProps({
  eyebrow: { type: String, default: '' },
  title: { type: String, default: '' },
  description: { type: String, default: '' },
})
</script>

<template>
  <div class="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-6" style="gap: 12px;">
    <div class="min-w-0" style="flex: 1 1 0;">
      <div
        v-if="eyebrow || $slots.eyebrow"
        class="font-mono text-fg-subtle uppercase mb-1.5 font-medium"
        style="font-size: 11px; letter-spacing: 0.04em;"
      >
        <slot name="eyebrow">{{ eyebrow }}</slot>
      </div>
      <h1
        class="text-fg font-semibold m-0"
        style="font-size: clamp(20px, 4vw, 24px); letter-spacing: -0.02em; line-height: 1.2;"
      >
        {{ title }}
      </h1>
      <p
        v-if="description"
        class="text-fg-muted"
        style="font-size: 13.5px; margin: 6px 0 0; max-width: 640px; line-height: 1.5;"
      >
        {{ description }}
      </p>
    </div>
    <div
      v-if="$slots.actions"
      class="flex items-center flex-wrap flex-shrink-0"
      style="gap: 8px;"
    >
      <slot name="actions" />
    </div>
  </div>
</template>
