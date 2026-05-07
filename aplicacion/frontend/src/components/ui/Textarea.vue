<!--
  Textarea.vue

  Variante multilinea de Input. Mismo estilo de borde y foco.
-->
<script setup>
import { ref } from 'vue'

defineProps({
  modelValue: { type: String, default: '' },
  placeholder: { type: String, default: '' },
  id: { type: String, default: '' },
  rows: { type: Number, default: 3 },
  mono: { type: Boolean, default: false },
})

defineEmits(['update:modelValue'])

const focused = ref(false)
</script>

<template>
  <textarea
    :id="id"
    :value="modelValue"
    :placeholder="placeholder"
    :rows="rows"
    class="bg-surface rounded-md outline-none resize-y transition-shadow duration-100 text-fg"
    :class="[mono ? 'font-mono' : 'font-sans', focused ? 'shadow-focus' : 'shadow-xs']"
    :style="{
      border: `1px solid ${focused ? 'var(--accent)' : 'var(--border)'}`,
      padding: '9px 11px',
      fontSize: '13px',
    }"
    @input="$emit('update:modelValue', $event.target.value)"
    @focus="focused = true"
    @blur="focused = false"
  ></textarea>
</template>
