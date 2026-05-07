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
  <div
    class="min-h-screen grid bg-bg"
    style="grid-template-columns: 1fr 1.05fr;"
  >
    <div
      class="flex flex-col bg-surface relative"
      :style="{
        padding: '40px 56px',
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
    <AuthVisualSide />
  </div>
</template>
