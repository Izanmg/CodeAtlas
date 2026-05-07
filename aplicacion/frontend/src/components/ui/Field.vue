<!--
  Field.vue

  Etiqueta + control + ayuda/error. Usado para envolver Input y Textarea
  en formularios.
-->
<script setup>
defineProps({
  label: { type: String, default: '' },
  hint: { type: String, default: '' },
  error: { type: String, default: '' },
  htmlFor: { type: String, default: '' },
  optional: { type: Boolean, default: false },
})
</script>

<template>
  <div class="flex flex-col" style="gap: 5px;">
    <label
      v-if="label"
      :for="htmlFor"
      class="flex justify-between text-fg font-medium"
      style="font-size: 12px;"
    >
      <span>{{ label }}</span>
      <span v-if="optional" class="text-fg-faint font-normal">opcional</span>
    </label>
    <slot />
    <span
      v-if="error"
      class="text-danger"
      style="font-size: 12px;"
    >{{ error }}</span>
    <span
      v-else-if="hint"
      class="text-fg-subtle"
      style="font-size: 11.5px;"
    >{{ hint }}</span>
  </div>
</template>
