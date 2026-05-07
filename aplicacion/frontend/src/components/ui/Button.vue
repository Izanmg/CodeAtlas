<!--
  Button.vue

  Botón estándar de la aplicación.
  Variantes: primary, secondary, ghost, danger.
  Tamaños: xs, sm, md, lg.
  Soporta iconos a izquierda/derecha pasando el nombre de un icono de
  lucide-vue-next a través de los slots `icon` y `iconRight`.
-->
<script setup>
import { computed } from 'vue'

const props = defineProps({
  variant: { type: String, default: 'secondary' }, // primary | secondary | ghost | danger
  size: { type: String, default: 'md' },           // xs | sm | md | lg
  type: { type: String, default: 'button' },
  disabled: { type: Boolean, default: false },
  fullWidth: { type: Boolean, default: false },
})

const sizeClasses = computed(() => ({
  xs: 'h-6 px-2 text-[12px] gap-[5px]',
  sm: 'h-7 px-2.5 text-[12.5px] gap-1.5',
  md: 'h-8 px-3 text-[13px] gap-1.5',
  lg: 'h-[38px] px-4 text-[14px] gap-2',
}[props.size]))

const variantClasses = computed(() => ({
  primary: 'bg-accent hover:bg-accent-hover text-accent-fg border border-accent shadow-xs',
  secondary: 'bg-surface hover:bg-bg-muted text-fg border border-border shadow-xs',
  ghost: 'bg-transparent hover:bg-bg-muted text-fg-muted hover:text-fg border border-transparent',
  danger: 'bg-surface hover:bg-danger-bg text-danger border border-border hover:border-danger',
}[props.variant]))
</script>

<template>
  <button
    :type="type"
    :disabled="disabled"
    class="focus-ring inline-flex items-center justify-center rounded-md font-medium whitespace-nowrap transition-colors duration-100"
    :class="[
      sizeClasses,
      variantClasses,
      disabled && 'opacity-50 cursor-not-allowed',
      fullWidth && 'w-full',
    ]"
    style="letter-spacing: -0.005em;"
  >
    <slot name="icon" />
    <slot />
    <slot name="iconRight" />
  </button>
</template>
