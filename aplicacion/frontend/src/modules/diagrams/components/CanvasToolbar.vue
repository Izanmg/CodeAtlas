<!--
  CanvasToolbar.vue

  Panel flotante en la parte superior central del canvas. Colapsado es una
  pastilla; al hacer clic se expande hacia abajo con el mismo formato que
  CanvasRules: secciones verticales con etiquetas y controles.

  Compone:
    - Toggle Relaciones / Flujos (modo del canvas)
    - Filtros por tipo de bloque (solo en modo Relaciones)
    - Toggle "mostrar relaciones indirectas" (solo en modo Relaciones)
    - Botón "ajustar vista"
    - Botón "Salir de foco" cuando hay un nodo seleccionado
-->
<script setup>
import { ref, computed } from 'vue'
import {
  Maximize, Focus, Network, Workflow,
  Sliders, ChevronUp, ChevronDown, Search, X, Lock,
} from 'lucide-vue-next'
import Input from '@/components/ui/Input.vue'
import { NODE_META, KIND_KEYS } from '../core/node-meta'

const FILTER_KEYS = KIND_KEYS.filter((k) => k !== 'rules')
const MAX_SUGGESTIONS = 8

const props = defineProps({
  visible:        { type: Object, required: true },
  counts:         { type: Object, required: true },
  focusActive:    { type: Boolean, default: false },
  mode:           { type: String, default: 'relations' },
  showIndirect:   { type: Boolean, default: true },
  search:         { type: String, default: '' },
  searchableNodes: { type: Array, default: () => [] },
  selectedNodeId: { type: String, default: null },
})

const emit = defineEmits([
  'toggle', 'fit', 'clearFocus', 'mode', 'toggleIndirect',
  'update:search', 'select-node',
])

const open = ref(false)
const inputFocused = ref(false)

const suggestions = computed(() => {
  const q = (props.search || '').trim().toLowerCase()
  if (!q) return []
  return props.searchableNodes
    .filter((n) =>
      n.name.toLowerCase().includes(q) || n.id.toLowerCase().includes(q)
    )
    .slice(0, MAX_SUGGESTIONS)
})

// El dropdown solo se muestra cuando hay texto, hay matches, no hay nodo
// ya bloqueado y el input está enfocado.
const dropdownVisible = computed(() =>
  inputFocused.value &&
  !props.selectedNodeId &&
  suggestions.value.length > 0
)

function clearSearch() {
  emit('update:search', '')
}

function pickSuggestion(node) {
  emit('select-node', node.id)
  inputFocused.value = false
}

function onInputBlur() {
  // Pequeño delay para que el click en una sugerencia se procese antes
  // de que el dropdown desaparezca.
  setTimeout(() => { inputFocused.value = false }, 120)
}
</script>

<template>
  <!-- Pill colapsado -->
  <button
    v-if="!open"
    class="absolute z-[5] bg-surface flex items-center justify-between font-mono text-fg-subtle hover:text-fg transition-colors duration-100"
    :style="{
      top: '12px',
      right: '12px',
      width: '260px',
      border: '1px solid var(--border)',
      borderRadius: '6px',
      padding: '8px 12px',
      fontSize: '12px',
      letterSpacing: '0.03em',
      boxShadow: 'var(--shadow-sm)',
    }"
    @click="open = true"
  >
    <span class="inline-flex items-center" style="gap: 8px;">
      <Sliders :size="13" />
      <span class="text-fg" style="font-weight: 600;">Vista del diagrama</span>
    </span>
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
      width: '260px',
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
        <Sliders :size="13" />
        <span class="text-fg" style="font-weight: 600;">Vista del diagrama</span>
      </span>
      <ChevronUp :size="13" style="opacity: 0.5;" />
    </button>

    <!-- Sección: Buscar -->
    <div :style="{ borderTop: '1px solid var(--border-subtle)', padding: '8px 12px' }">
      <div
        class="font-mono uppercase flex items-center"
        :style="{ fontSize: '9.5px', letterSpacing: '0.07em', color: 'var(--fg-faint)', marginBottom: '6px', gap: '6px' }"
      >
        Buscar nodo
        <Lock
          v-if="selectedNodeId"
          :size="9"
          :style="{ color: 'var(--accent)' }"
          title="Nodo bloqueado"
        />
      </div>
      <div class="relative">
        <Input
          :model-value="search"
          :placeholder="selectedNodeId ? '' : 'Nombre del nodo…'"
          @update:model-value="(v) => emit('update:search', v)"
          @focus="inputFocused = true"
          @blur="onInputBlur"
        >
          <template #icon>
            <Lock v-if="selectedNodeId" :size="12" :style="{ color: 'var(--accent)' }" />
            <Search v-else :size="12" />
          </template>
        </Input>
        <button
          v-if="search || selectedNodeId"
          class="absolute grid place-items-center text-fg-faint hover:text-fg"
          :style="{
            top: '50%',
            right: '8px',
            transform: 'translateY(-50%)',
            width: '18px',
            height: '18px',
            borderRadius: '3px',
          }"
          title="Limpiar búsqueda"
          @mousedown.prevent
          @click="clearSearch"
        >
          <X :size="11" />
        </button>

        <!-- Dropdown de autocompletado -->
        <div
          v-if="dropdownVisible"
          class="absolute bg-surface rounded-md overflow-hidden"
          :style="{
            top: 'calc(100% + 4px)',
            left: 0,
            right: 0,
            border: '1px solid var(--border)',
            boxShadow: 'var(--shadow-md)',
            zIndex: 10,
            maxHeight: '240px',
            overflowY: 'auto',
          }"
        >
          <button
            v-for="(s, i) in suggestions"
            :key="s.id"
            class="w-full flex items-center text-left hover:bg-bg-subtle transition-colors duration-100"
            :style="{
              padding: '6px 10px',
              gap: '8px',
              borderTop: i > 0 ? '1px solid var(--border-subtle)' : 'none',
            }"
            @mousedown.prevent
            @click="pickSuggestion(s)"
          >
            <span
              :style="{
                width: '8px',
                height: '8px',
                borderRadius: '2px',
                background: NODE_META[s.kind]?.color || 'var(--fg-faint)',
                flexShrink: 0,
              }"
            />
            <span class="text-fg flex-1 whitespace-nowrap overflow-hidden text-ellipsis" style="font-size: 12px;">
              {{ s.name }}
            </span>
            <span
              class="font-mono uppercase text-fg-faint"
              :style="{ fontSize: '9px', letterSpacing: '0.06em' }"
            >{{ NODE_META[s.kind]?.label || s.kind }}</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Sección: Modo -->
    <div :style="{ borderTop: '1px solid var(--border-subtle)', padding: '8px 12px' }">
      <div
        class="font-mono uppercase"
        :style="{ fontSize: '9.5px', letterSpacing: '0.07em', color: 'var(--fg-faint)', marginBottom: '6px' }"
      >Modo</div>
      <div class="grid" style="grid-template-columns: 1fr 1fr; gap: 4px;">
        <button
          class="inline-flex items-center justify-center transition-all duration-100"
          :style="{
            padding: '0 8px',
            height: '26px',
            background: mode === 'relations' ? 'var(--bg-subtle)' : 'transparent',
            border: `1px solid ${mode === 'relations' ? 'var(--border)' : 'transparent'}`,
            borderRadius: '4px',
            color: mode === 'relations' ? 'var(--fg)' : 'var(--fg-subtle)',
            fontSize: '11.5px',
            fontWeight: 500,
            gap: '6px',
          }"
          @click="$emit('mode', 'relations')"
        >
          <Network :size="11" /> Relaciones
        </button>
        <button
          class="inline-flex items-center justify-center transition-all duration-100"
          :style="{
            padding: '0 8px',
            height: '26px',
            background: mode === 'flows' ? 'var(--bg-subtle)' : 'transparent',
            border: `1px solid ${mode === 'flows' ? 'var(--border)' : 'transparent'}`,
            borderRadius: '4px',
            color: mode === 'flows' ? 'var(--kind-flow)' : 'var(--fg-subtle)',
            fontSize: '11.5px',
            fontWeight: 500,
            gap: '6px',
          }"
          @click="$emit('mode', 'flows')"
        >
          <Workflow :size="11" /> Flujos
        </button>
      </div>
    </div>

    <!-- Sección: Tipos visibles -->
    <div
      v-if="mode === 'relations'"
      :style="{ borderTop: '1px solid var(--border-subtle)', padding: '8px 12px' }"
    >
      <div
        class="font-mono uppercase"
        :style="{ fontSize: '9.5px', letterSpacing: '0.07em', color: 'var(--fg-faint)', marginBottom: '6px' }"
      >Tipos visibles</div>
      <div class="flex flex-col" style="gap: 3px;">
        <button
          v-for="k in FILTER_KEYS"
          :key="k"
          class="w-full flex items-center transition-all duration-100"
          :style="{
            padding: '5px 8px',
            background: visible[k] ? 'var(--bg-subtle)' : 'transparent',
            border: `1px solid ${visible[k] ? 'var(--border)' : 'transparent'}`,
            borderRadius: '4px',
            color: visible[k] ? 'var(--fg)' : 'var(--fg-faint)',
            fontSize: '11.5px',
            fontWeight: 500,
            gap: '8px',
          }"
          @click="$emit('toggle', k)"
        >
          <span
            :style="{
              width: '8px',
              height: '8px',
              borderRadius: '2px',
              background: NODE_META[k].color,
              opacity: visible[k] ? 1 : 0.3,
            }"
          />
          <span class="flex-1 text-left">{{ NODE_META[k].label }}</span>
          <span class="font-mono" :style="{ fontSize: '10.5px', color: visible[k] ? 'var(--fg-faint)' : 'var(--fg-faint)' }">
            {{ counts[k] || 0 }}
          </span>
        </button>
      </div>
    </div>

    <!-- Sección: Conexiones -->
    <div
      v-if="mode === 'relations'"
      :style="{ borderTop: '1px solid var(--border-subtle)', padding: '8px 12px' }"
    >
      <div
        class="font-mono uppercase"
        :style="{ fontSize: '9.5px', letterSpacing: '0.07em', color: 'var(--fg-faint)', marginBottom: '6px' }"
      >Conexiones</div>
      <button
        class="w-full flex items-center transition-all duration-100"
        :style="{
          padding: '5px 8px',
          background: showIndirect ? 'var(--bg-subtle)' : 'transparent',
          border: `1px solid ${showIndirect ? 'var(--border)' : 'transparent'}`,
          borderRadius: '4px',
          color: showIndirect ? 'var(--fg)' : 'var(--fg-faint)',
          fontSize: '11.5px',
          fontWeight: 500,
          gap: '8px',
        }"
        @click="$emit('toggleIndirect')"
      >
        <svg width="14" height="6" :style="{ flexShrink: 0, opacity: showIndirect ? 1 : 0.4 }">
          <line x1="0" y1="3" x2="14" y2="3" stroke="currentColor" stroke-width="1.4" stroke-dasharray="3 3" />
        </svg>
        <span class="flex-1 text-left">Mostrar indirectas</span>
        <span
          :style="{
            fontSize: '9.5px',
            fontFamily: 'monospace',
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            padding: '2px 6px',
            borderRadius: '3px',
            background: showIndirect ? 'var(--accent-soft)' : 'var(--bg-muted)',
            color: showIndirect ? 'var(--accent)' : 'var(--fg-faint)',
          }"
        >{{ showIndirect ? 'on' : 'off' }}</span>
      </button>
    </div>

    <!-- Sección: Acciones -->
    <div :style="{ borderTop: '1px solid var(--border-subtle)', padding: '8px 12px', display: 'flex', flexDirection: 'column', gap: '4px' }">
      <button
        class="w-full inline-flex items-center text-fg-subtle hover:bg-bg-subtle hover:text-fg transition-colors duration-100"
        :style="{ padding: '5px 8px', borderRadius: '4px', fontSize: '11.5px', fontWeight: 500, gap: '8px' }"
        @click="$emit('fit')"
      >
        <Maximize :size="11" /> Ajustar vista
      </button>
      <button
        v-if="focusActive"
        class="w-full inline-flex items-center bg-accent-soft text-accent transition-colors duration-100"
        :style="{ padding: '5px 8px', borderRadius: '4px', fontSize: '11.5px', fontWeight: 500, gap: '8px' }"
        @click="$emit('clearFocus')"
      >
        <Focus :size="11" /> Salir de foco
        <kbd style="margin-left: auto; font-size: 9.5px;">esc</kbd>
      </button>
    </div>
  </div>
</template>
