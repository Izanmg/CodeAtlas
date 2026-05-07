<!--
  Segmented.vue

  Control segmentado tipo iOS — varios botones agrupados, uno activo.
  Cada opción: { value, label, icon? (componente Lucide), count? }
-->
<script setup>
defineProps({
  options: { type: Array, default: () => [] },
  modelValue: { type: [String, Number], default: '' },
})

defineEmits(['update:modelValue'])
</script>

<template>
  <div
    class="inline-flex bg-bg-muted rounded-md"
    :style="{ border: '1px solid var(--border)', padding: '2px', gap: '1px' }"
  >
    <button
      v-for="opt in options"
      :key="opt.value"
      class="font-medium rounded inline-flex items-center transition-colors duration-100"
      :class="modelValue === opt.value
        ? 'bg-surface text-fg shadow-xs'
        : 'bg-transparent text-fg-muted'"
      style="height: 24px; padding: 0 10px; font-size: 12px; gap: 5px;"
      @click="$emit('update:modelValue', opt.value)"
    >
      <component :is="opt.icon" v-if="opt.icon" :size="12" />
      {{ opt.label }}
      <span
        v-if="opt.count !== undefined"
        class="font-mono"
        :class="modelValue === opt.value ? 'text-fg-subtle' : 'text-fg-faint'"
        style="font-size: 10.5px;"
      >{{ opt.count }}</span>
    </button>
  </div>
</template>
