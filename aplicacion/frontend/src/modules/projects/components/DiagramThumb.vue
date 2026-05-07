<!--
  DiagramThumb.vue

  Miniatura SVG de un diagrama dentro de la tarjeta del proyecto.
  Es un dibujo decorativo, no refleja el contenido real del diagrama.
-->
<template>
  <div
    class="dot-canvas relative overflow-hidden bg-bg-subtle rounded-md"
    :style="{
      width: '100%',
      height: '130px',
      border: '1px solid var(--border-subtle)',
    }"
  >
    <svg
      viewBox="0 0 320 140"
      preserveAspectRatio="xMidYMid meet"
      class="absolute inset-0 w-full h-full"
    >
      <g stroke="var(--border-strong)" stroke-width="0.6" fill="none" opacity="0.6">
        <path d="M40 30 L 100 60" />
        <path d="M100 60 L 160 30" />
        <path d="M160 30 L 220 60" />
        <path d="M100 60 L 100 100" />
        <path d="M160 60 L 160 100" />
        <path d="M220 60 L 220 100" />
        <path d="M40 30 L 280 30" />
      </g>
      <rect
        v-for="x in [20, 80, 140, 200, 260]"
        :key="`f-${x}`"
        :x="x" y="14" width="40" height="13" rx="3"
        fill="var(--kind-frontend-bg)" stroke="var(--kind-frontend)" stroke-width="0.7"
      />
      <rect
        v-for="x in [40, 100, 160, 220]"
        :key="`b-${x}`"
        :x="x" y="50" width="40" height="13" rx="3"
        fill="var(--kind-backend-bg)" stroke="var(--kind-backend)" stroke-width="0.7"
      />
      <rect
        v-for="x in [80, 140, 200]"
        :key="`d-${x}`"
        :x="x" y="86" width="40" height="13" rx="3"
        fill="var(--kind-database-bg)" stroke="var(--kind-database)" stroke-width="0.7"
      />
      <circle
        v-for="x in [60, 240]"
        :key="`fl-${x}`"
        :cx="x" cy="118" r="6"
        fill="var(--kind-flow-bg)" stroke="var(--kind-flow)" stroke-width="0.7"
      />
    </svg>
  </div>
</template>
