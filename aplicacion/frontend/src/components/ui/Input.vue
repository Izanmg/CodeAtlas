<!--
  Input.vue

  Campo de texto con borde que cambia a accent al recibir foco.
  Soporta:
    - v-model con `modelValue`
    - prefijo de icono (slot `icon`)
    - tipografía mono (prop `mono`) para rutas, IDs, etc.
-->
<script setup>
import { ref } from 'vue'

defineProps({
  modelValue: { type: [String, Number], default: '' },
  type: { type: String, default: 'text' },
  placeholder: { type: String, default: '' },
  id: { type: String, default: '' },
  autofocus: { type: Boolean, default: false },
  mono: { type: Boolean, default: false },
  readonly: { type: Boolean, default: false },
})

const emit = defineEmits(['update:modelValue', 'focus', 'blur'])

const focused = ref(false)
</script>

<template>
  <div
    class="relative flex items-center bg-surface rounded-md transition-shadow duration-100"
    :class="focused ? 'shadow-focus' : 'shadow-xs'"
    :style="{ border: `1px solid ${focused ? 'var(--accent)' : 'var(--border)'}` }"
  >
    <span
      v-if="$slots.icon"
      class="pl-2.5 text-fg-faint flex items-center"
    >
      <slot name="icon" />
    </span>
    <input
      :id="id"
      :type="type"
      :value="modelValue"
      :placeholder="placeholder"
      :autofocus="autofocus"
      :readonly="readonly"
      class="w-full bg-transparent border-none outline-none text-fg"
      :class="mono ? 'font-mono' : ''"
      style="padding: 8px 11px; font-size: 13px;"
      @input="emit('update:modelValue', $event.target.value)"
      @focus="focused = true; emit('focus', $event)"
      @blur="focused = false; emit('blur', $event)"
    />
  </div>
</template>
