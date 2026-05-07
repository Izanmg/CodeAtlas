<!--
  ProjectThumb.vue

  Miniatura visual de un proyecto: una de tres variantes de "constelación
  de nodos" elegida deterministamente a partir del id del proyecto, en
  fondo de puntos.
-->
<script setup>
import { computed } from 'vue'

const props = defineProps({
  project: { type: Object, required: true },
})

const VARIANTS = [
  {
    positions: [[20,30],[55,18],[88,30],[40,55],[72,55],[55,82]],
    links: [[0,1],[1,2],[0,3],[2,4],[3,4],[3,5],[4,5]],
  },
  {
    positions: [[18,25],[18,55],[18,82],[55,25],[55,55],[55,82],[88,55]],
    links: [[0,3],[1,4],[2,5],[3,6],[4,6],[5,6]],
  },
  {
    positions: [[20,50],[40,25],[60,50],[40,75],[80,25],[80,75]],
    links: [[0,1],[1,2],[2,3],[3,0],[1,4],[2,4],[2,5],[3,5]],
  },
]

const COLORS = [
  'var(--kind-backend)',
  'var(--kind-frontend)',
  'var(--kind-screen)',
  'var(--kind-database)',
  'var(--kind-flow)',
  'var(--kind-rules)',
]

const variant = computed(() => {
  const id = props.project.id
  const seed = (id.charCodeAt(2) || 0) + (id.charCodeAt(4) || 0)
  return { ...VARIANTS[seed % VARIANTS.length], seed }
})
</script>

<template>
  <div
    class="dot-canvas relative overflow-hidden bg-bg-subtle rounded-md"
    :style="{ width: '100%', height: '96px', border: '1px solid var(--border-subtle)' }"
  >
    <svg
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      class="absolute inset-0 w-full h-full"
    >
      <g stroke="var(--border-strong)" stroke-width="0.4" opacity="0.7" fill="none">
        <line
          v-for="([a, b], i) in variant.links"
          :key="i"
          :x1="variant.positions[a][0]"
          :y1="variant.positions[a][1]"
          :x2="variant.positions[b][0]"
          :y2="variant.positions[b][1]"
        />
      </g>
      <circle
        v-for="([x, y], i) in variant.positions"
        :key="`c-${i}`"
        :cx="x"
        :cy="y"
        r="3.4"
        :fill="COLORS[(i + variant.seed) % COLORS.length]"
      />
    </svg>
  </div>
</template>
