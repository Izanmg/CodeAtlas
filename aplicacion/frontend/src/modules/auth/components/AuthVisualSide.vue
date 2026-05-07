<!--
  AuthVisualSide.vue

  Columna decorativa de las pantallas de auth. Muestra un fragmento SVG
  estático de un diagrama (subsistema de autenticación) sobre fondo de
  puntos. Es puramente visual — no hay interacción.
-->
<script setup>
const NODES = [
  { x: 140, y: 355, label: 'auth.fe', color: 'var(--kind-frontend)', bg: 'var(--kind-frontend-bg)' },
  { x: 340, y: 295, label: 'auth.be', color: 'var(--kind-backend)', bg: 'var(--kind-backend-bg)' },
  { x: 540, y: 355, label: 'login', color: 'var(--kind-screen)', bg: 'var(--kind-screen-bg)' },
  { x: 340, y: 455, label: 'users', color: 'var(--kind-database)', bg: 'var(--kind-database-bg)' },
  { x: 540, y: 455, label: 'login.flow', color: 'var(--kind-flow)', bg: 'var(--kind-flow-bg)' },
  { x: 140, y: 555, label: 'rules', color: 'var(--kind-rules)', bg: 'var(--kind-rules-bg)' },
  { x: 340, y: 555, label: 'dashboard', color: 'var(--kind-frontend)', bg: 'var(--kind-frontend-bg)' },
]

const NODE_W = 84
const NODE_H = 50

const LINKS = [
  ['M180 380 L 380 320'],
  ['M380 320 L 580 380'],
  ['M180 380 L 380 480'],
  ['M380 480 L 580 480'],
  ['M380 320 L 380 480'],
  ['M580 380 L 580 480'],
  ['M180 580 L 380 580'],
  ['M380 480 L 380 580'],
]
</script>

<template>
  <div
    class="dot-canvas relative overflow-hidden bg-bg-subtle"
  >
    <svg
      viewBox="0 0 800 900"
      preserveAspectRatio="xMidYMid slice"
      class="absolute inset-0 w-full h-full"
    >
      <g stroke="var(--accent)" stroke-width="1.2" opacity="0.45" fill="none">
        <path v-for="(p, i) in LINKS" :key="i" :d="p[0]" />
      </g>
      <g v-for="n in NODES" :key="n.label">
        <rect
          :x="n.x" :y="n.y" :width="NODE_W" :height="NODE_H"
          rx="5"
          :fill="n.bg" :stroke="n.color" stroke-width="1.2"
        />
        <rect :x="n.x" :y="n.y" :width="NODE_W" height="3" rx="1.5" :fill="n.color" />
        <text
          :x="n.x + NODE_W/2"
          :y="n.y + NODE_H/2 + 5"
          text-anchor="middle"
          style="font: 11.5px var(--font-mono); fill: var(--fg); font-weight: 500;"
        >{{ n.label }}</text>
      </g>
      <g style="font: 10px var(--font-mono); fill: var(--fg-faint); letter-spacing: 0.04em;">
        <text x="40" y="56" style="text-transform: uppercase;">diagram.preview</text>
        <text x="40" y="74" fill="var(--fg-subtle)">authentication subsystem</text>
        <text x="40" y="850">7 nodes · 8 edges</text>
        <text x="660" y="850">fig.01</text>
      </g>
    </svg>
  </div>
</template>
