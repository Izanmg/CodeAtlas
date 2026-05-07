<!--
  Logo.vue

  Logotipo geométrico "C" de CodeAtlas, recreado del handoff de diseño.
  Acepta dos parámetros:
    - size: tamaño del cuadrado del icono en píxeles (por defecto 22)
    - showWordmark: si se debe mostrar el texto "codeatlas" al lado
-->
<script setup>
defineProps({
  size: { type: Number, default: 22 },
  showWordmark: { type: Boolean, default: true },
})
</script>

<template>
  <span class="inline-flex items-center" style="gap: 9px;">
    <svg
      :width="size"
      :height="size"
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient :id="`lg-${size}`" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="var(--accent)" />
          <stop offset="100%" stop-color="var(--accent)" stop-opacity="0.7" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="7" :fill="`url(#lg-${size})`" />
      <path
        d="M22 9 L13 9 L9 13 L9 19 L13 23 L22 23"
        stroke="white"
        stroke-width="2.6"
        stroke-linecap="square"
        stroke-linejoin="miter"
        fill="none"
      />
      <circle cx="22" cy="9" r="1.4" fill="white" />
      <circle cx="22" cy="23" r="1.4" fill="white" />
    </svg>
    <span
      v-if="showWordmark"
      class="font-semibold text-fg"
      :style="{ fontSize: size * 0.62 + 'px', letterSpacing: '-0.02em' }"
    >
      codeatlas
    </span>
  </span>
</template>
