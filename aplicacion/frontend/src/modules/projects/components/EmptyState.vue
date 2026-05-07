<!--
  EmptyState.vue

  Tarjeta de estado vacío reutilizable. Se compone de:
    - icono central (slot `icon`)
    - título
    - descripción
    - acción opcional (slot `action`)
-->
<template>
  <div
    class="text-center flex flex-col items-center bg-surface rounded-lg"
    :style="{
      padding: '56px 24px',
      border: '1px dashed var(--border-strong)',
      gap: '10px',
    }"
  >
    <div
      class="grid place-items-center bg-bg-muted text-fg-faint rounded-md"
      :style="{ width: '44px', height: '44px', marginBottom: '4px' }"
    >
      <slot name="icon" />
    </div>
    <h3
      class="text-fg font-semibold m-0"
      :style="{ fontSize: '16px', letterSpacing: '-0.015em' }"
    >
      <slot name="title" />
    </h3>
    <p
      class="text-fg-muted m-0"
      :style="{ maxWidth: '420px', fontSize: '13px' }"
    >
      <slot name="description" />
    </p>
    <div v-if="$slots.action" :style="{ marginTop: '6px' }">
      <slot name="action" />
    </div>
  </div>
</template>
