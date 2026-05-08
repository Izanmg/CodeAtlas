<!--
  CanvasFlowSelector.vue

  Panel flotante en la esquina superior derecha del canvas (solo visible en
  modo Flujos). Colapsado: muestra el número total de flujos. Expandido:
  lista de flujos seleccionables, uno activo a la vez.
-->
<script setup>
import { ref } from 'vue'
import { Workflow, ChevronUp, ChevronDown, LayoutGrid } from 'lucide-vue-next'

defineProps({
  flows: { type: Array, default: () => [] },
  activeId: { type: String, default: null },
})

defineEmits(['select'])

const open = ref(true)
</script>

<template>
  <!-- Pill colapsado -->
  <button
    v-if="!open"
    class="absolute z-[5] bg-surface inline-flex items-center font-mono text-fg-subtle hover:text-fg transition-colors duration-100"
    :style="{
      top: '64px',
      right: '12px',
      border: '1px solid var(--border)',
      borderRadius: '6px',
      padding: '7px 12px',
      fontSize: '12px',
      letterSpacing: '0.03em',
      boxShadow: 'var(--shadow-sm)',
      gap: '8px',
    }"
    @click="open = true"
  >
    <Workflow :size="13" :style="{ color: 'var(--kind-flow)' }" />
    <span :style="{ color: 'var(--kind-flow)', fontWeight: 600 }">{{ flows.length }}</span>
    flujos
    <ChevronDown :size="13" style="opacity: 0.5;" />
  </button>

  <!-- Panel expandido -->
  <div
    v-else
    class="absolute z-[5] bg-surface rounded-md overflow-hidden"
    :style="{
      top: '64px',
      right: '12px',
      border: '1px solid var(--border)',
      boxShadow: 'var(--shadow-md)',
      width: '230px',
      maxHeight: 'calc(100vh - 100px)',
      overflowY: 'auto',
    }"
  >
    <!-- Header -->
    <button
      class="w-full flex items-center justify-between font-mono text-fg-subtle hover:bg-bg-subtle transition-colors duration-100"
      :style="{ padding: '8px 12px', fontSize: '10.5px', letterSpacing: '0.05em' }"
      @click="open = false"
    >
      <span class="inline-flex items-center" style="gap: 6px;">
        <Workflow :size="11" :style="{ color: 'var(--kind-flow)' }" />
        Flujos del sistema
      </span>
      <span class="inline-flex items-center" style="gap: 6px;">
        <span class="text-fg-faint">{{ flows.length }}</span>
        <ChevronUp :size="11" />
      </span>
    </button>

    <!-- Estado vacío -->
    <div
      v-if="flows.length === 0"
      class="text-fg-faint font-mono"
      :style="{ padding: '10px 12px', fontSize: '11px', borderTop: '1px solid var(--border-subtle)' }"
    >
      Sin flujos definidos
    </div>

    <!-- Opción: todos los flujos -->
    <button
      v-if="flows.length > 0"
      class="w-full text-left flex items-center"
      :style="{
        padding: '8px 12px',
        gap: '8px',
        borderTop: '1px solid var(--border-subtle)',
        background: activeId === null ? 'var(--kind-flow-bg)' : 'transparent',
      }"
      @click="$emit('select', null)"
    >
      <LayoutGrid
        :size="12"
        :style="{ color: activeId === null ? 'var(--kind-flow)' : 'var(--fg-faint)' }"
      />
      <span
        class="text-fg flex-1"
        :style="{ fontSize: '12px', fontWeight: activeId === null ? 600 : 500 }"
      >Todos los flujos</span>
      <span
        class="font-mono text-fg-faint"
        :style="{ fontSize: '10px', letterSpacing: '0.05em' }"
      >{{ flows.length }}</span>
    </button>

    <!-- Lista -->
    <button
      v-for="f in flows"
      :key="f.id"
      class="w-full text-left flex flex-col"
      :style="{
        padding: '8px 12px',
        gap: '3px',
        borderTop: '1px solid var(--border-subtle)',
        background: f.id === activeId ? 'var(--kind-flow-bg)' : 'transparent',
      }"
      @click="$emit('select', f.id)"
    >
      <div class="flex items-center" style="gap: 6px;">
        <span
          :style="{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            background: f.id === activeId ? 'var(--kind-flow)' : 'var(--border)',
          }"
        />
        <span
          class="text-fg whitespace-nowrap overflow-hidden text-ellipsis flex-1"
          :style="{ fontSize: '12px', fontWeight: f.id === activeId ? 600 : 500 }"
        >{{ f.name }}</span>
      </div>
      <div
        v-if="f.trigger"
        class="text-fg-faint whitespace-nowrap overflow-hidden text-ellipsis"
        :style="{ fontSize: '10.5px', paddingLeft: '12px', lineHeight: 1.3 }"
      >
        {{ f.trigger }}
      </div>
      <div
        class="font-mono text-fg-faint"
        :style="{ fontSize: '10px', paddingLeft: '12px', letterSpacing: '0.05em' }"
      >
        {{ f.steps?.length || 0 }} pasos
      </div>
    </button>
  </div>
</template>
