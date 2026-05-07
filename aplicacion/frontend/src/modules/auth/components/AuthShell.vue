<!--
  AuthShell.vue

  Layout en dos columnas usado tanto por Login como por Register.
  Columna izquierda: formulario centrado verticalmente.
  Columna derecha: visual decorativo con miniatura SVG de un diagrama.
-->
<script setup>
import Logo from '@/components/ui/Logo.vue'
import AuthVisualSide from './AuthVisualSide.vue'
</script>

<template>
  <div class="min-h-screen bg-bg grid grid-cols-1 md:grid-cols-[1fr_1.05fr]">
    <div
      class="flex flex-col bg-surface relative"
      :style="{
        padding: 'clamp(24px, 6vw, 56px) clamp(20px, 7vw, 56px)',
        borderRight: '1px solid var(--border)',
      }"
    >
      <div class="flex items-center" style="margin-bottom: 8px;">
        <Logo :size="22" />
      </div>
      <div class="my-auto w-full" style="max-width: 360px;">
        <slot />
      </div>
      <div
        class="flex justify-between font-mono text-fg-faint"
        style="font-size: 10.5px; letter-spacing: 0.04em;"
      >
        <span>v0.1.0</span>
        <span>codeatlas.dev</span>
      </div>
    </div>
    <AuthVisualSide class="hidden md:block" />
  </div>
</template>
