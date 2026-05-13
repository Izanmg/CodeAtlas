<!--
  CanvasModuleDeps.vue

  Panel flotante en la esquina superior derecha del deep-dive. Recoge en
  un solo sitio todas las conexiones externas del módulo:
    - Módulos dependidos (depends-on / consumes-api) → permite saltar al
      deep-dive de cada uno.
    - Pantallas vinculadas a algún archivo del módulo (vía screen.file)
      → al pulsar selecciona el archivo destino en el canvas actual.

  Sigue el mismo patrón pill/panel que CanvasFolders y CanvasRules.
-->
<script setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  Network, ChevronUp, ChevronDown,
  Server, LayoutPanelTop, Monitor, ArrowRight,
} from 'lucide-vue-next'

const props = defineProps({
  modules: { type: Array, default: () => [] },
  screens: { type: Array, default: () => [] },
})

const emit = defineEmits(['select-file'])

const route = useRoute()
const router = useRouter()

const open = ref(false)
const total = computed(() => props.modules.length + props.screens.length)

function layerIcon(layer) {
  return layer === 'frontend' ? LayoutPanelTop : Server
}
function layerColor(layer) {
  return `var(--kind-${layer || 'backend'})`
}

function goToModule(modId) {
  router.push(`/diagrams/${route.params.id}/modules/${modId}`)
}
</script>

<template>
  <template v-if="total > 0">
    <!-- Pill colapsado -->
    <button
      v-if="!open"
      class="absolute z-[5] bg-surface inline-flex items-center font-mono text-fg-subtle hover:text-fg transition-colors duration-100"
      :style="{
        top: '12px',
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
      <Network :size="13" class="text-fg-muted" />
      <span class="text-fg" style="font-weight: 600;">{{ total }}</span>
      {{ total === 1 ? 'dependencia' : 'dependencias' }}
      <ChevronDown :size="13" style="opacity: 0.5;" />
    </button>

    <!-- Panel expandido -->
    <div
      v-else
      class="absolute z-[5] bg-surface rounded-md overflow-hidden"
      :style="{
        top: '12px',
        right: '12px',
        border: '1px solid var(--border)',
        boxShadow: 'var(--shadow-md)',
        width: '270px',
        maxHeight: 'calc(100vh - 100px)',
        overflowY: 'auto',
      }"
    >
      <!-- Header -->
      <button
        class="w-full flex items-center justify-between text-fg-subtle hover:bg-bg-subtle transition-colors duration-100"
        :style="{ padding: '8px 12px', fontSize: '12px', letterSpacing: '0.03em' }"
        @click="open = false"
      >
        <span class="inline-flex items-center" style="gap: 8px;">
          <Network :size="13" class="text-fg-muted" />
          <span class="text-fg" style="font-weight: 600;">Dependencias del módulo</span>
        </span>
        <ChevronUp :size="13" style="opacity: 0.5;" />
      </button>

      <!-- Sección: módulos -->
      <template v-if="modules.length > 0">
        <div
          class="font-mono uppercase"
          :style="{
            padding: '8px 12px 4px',
            fontSize: '9.5px',
            letterSpacing: '0.07em',
            color: 'var(--fg-faint)',
            borderTop: '1px solid var(--border-subtle)',
          }"
        >Módulos · {{ modules.length }}</div>
        <button
          v-for="mod in modules"
          :key="`mod-${mod.id}`"
          class="w-full flex items-center text-left hover:bg-bg-subtle transition-colors duration-100"
          :style="{
            padding: '8px 12px',
            gap: '10px',
          }"
          @click="goToModule(mod.id)"
        >
          <div
            class="grid place-items-center flex-shrink-0 rounded-sm"
            :style="{
              width: '24px',
              height: '24px',
              background: 'var(--bg-muted)',
              color: layerColor(mod.layer),
            }"
          >
            <component :is="layerIcon(mod.layer)" :size="12" />
          </div>
          <div class="flex-1 min-w-0">
            <div
              class="font-mono uppercase"
              :style="{
                fontSize: '8.5px',
                color: layerColor(mod.layer),
                letterSpacing: '0.07em',
                lineHeight: 1,
                marginBottom: '3px',
              }"
            >{{ mod.layer }}</div>
            <div class="text-fg font-medium truncate" style="font-size: 12px;">
              {{ mod.name }}
            </div>
            <div
              class="text-fg-faint font-mono truncate"
              style="font-size: 10px; margin-top: 1px;"
            >{{ mod.id }} · {{ mod.via }}</div>
          </div>
          <ArrowRight :size="12" class="text-fg-faint flex-shrink-0" />
        </button>
      </template>

      <!-- Sección: pantallas -->
      <template v-if="screens.length > 0">
        <div
          class="font-mono uppercase"
          :style="{
            padding: '8px 12px 4px',
            fontSize: '9.5px',
            letterSpacing: '0.07em',
            color: 'var(--fg-faint)',
            borderTop: '1px solid var(--border-subtle)',
          }"
        >Pantallas · {{ screens.length }}</div>
        <button
          v-for="scr in screens"
          :key="`scr-${scr.id}`"
          class="w-full flex items-center text-left hover:bg-bg-subtle transition-colors duration-100"
          :style="{
            padding: '8px 12px',
            gap: '10px',
          }"
          @click="emit('select-file', scr.fileId)"
        >
          <div
            class="grid place-items-center flex-shrink-0 rounded-sm"
            :style="{
              width: '24px',
              height: '24px',
              background: 'var(--bg-muted)',
              color: 'var(--kind-screen)',
            }"
          >
            <Monitor :size="12" />
          </div>
          <div class="flex-1 min-w-0">
            <div
              class="font-mono uppercase"
              :style="{
                fontSize: '8.5px',
                color: 'var(--kind-screen)',
                letterSpacing: '0.07em',
                lineHeight: 1,
                marginBottom: '3px',
              }"
            >screen</div>
            <div class="text-fg font-medium truncate" style="font-size: 12px;">
              {{ scr.name }}
            </div>
            <div
              v-if="scr.route"
              class="text-fg-faint font-mono truncate"
              style="font-size: 10px; margin-top: 1px;"
            >{{ scr.route }}</div>
          </div>
          <ArrowRight :size="12" class="text-fg-faint flex-shrink-0" />
        </button>
      </template>
    </div>
  </template>
</template>
