<!--
  CanvasRules.vue

  Panel flotante en la esquina superior izquierda del canvas que muestra
  las reglas del sistema. Colapsado por defecto: solo muestra el número
  de reglas. Al hacer clic se expande con el listado completo por categoría.
-->
<script setup>
import { ref, computed } from 'vue'
import { Shield, ChevronUp, ChevronDown } from 'lucide-vue-next'

const props = defineProps({
  rules:    { type: Object, default: () => ({}) },
  overview: { type: String, default: '' },
})

const open = ref(false)

const groups = computed(() => [
  { key: 'auth',          tag: 'auth',  label: 'Autenticación',     items: props.rules.auth },
  { key: 'navigation',    tag: 'nav',   label: 'Navegación',        items: props.rules.navigation },
  { key: 'validation',    tag: 'valid', label: 'Validación',        items: props.rules.validation },
  { key: 'conventions',   tag: 'conv',  label: 'Convenciones',      items: props.rules.conventions },
  { key: 'technicalDecisions', tag: 'tech', label: 'Decisiones técnicas', items: props.rules.technicalDecisions },
].filter((g) => g.items?.length > 0))

const total = computed(() =>
  groups.value.reduce((s, g) => s + (g.items?.length || 0), 0)
)

// Extensiones libres definidas en 05-system-rules.md (## Performance, etc.).
const extensionEntries = computed(() => {
  const ext = props.rules.extensions
  if (!ext || typeof ext !== 'object') return []
  return Object.entries(ext).filter(([, v]) => v != null && String(v).trim() !== '')
})

function formatTitle(key) {
  return key
    .split(/[\s_-]+/)
    .filter(Boolean)
    .map((w) => w[0].toUpperCase() + w.slice(1))
    .join(' ')
}
</script>

<template>
  <!-- Pill colapsado -->
  <button
    v-if="!open"
    class="absolute z-[5] bg-surface inline-flex items-center font-mono text-fg-subtle hover:text-fg transition-colors duration-100"
    :style="{
      top: '12px',
      left: '12px',
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
    <Shield :size="13" style="color: var(--kind-rules);" />
    <span style="color: var(--kind-rules); font-weight: 600;">{{ total }}</span>
    reglas del sistema
    <ChevronDown :size="13" style="opacity: 0.5;" />
  </button>

  <!-- Panel expandido -->
  <div
    v-else
    class="absolute z-[5] bg-surface rounded-md overflow-hidden"
    :style="{
      top: '12px',
      left: '12px',
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
        <Shield :size="11" style="color: var(--kind-rules);" />
        Reglas del sistema
      </span>
      <span class="inline-flex items-center" style="gap: 6px;">
        <span class="text-fg-faint">{{ total }}</span>
        <ChevronUp :size="11" />
      </span>
    </button>

    <!-- Overview del proyecto (sección ## Overview de 01-modules.md) -->
    <div
      v-if="overview"
      :style="{ borderTop: '1px solid var(--border-subtle)' }"
    >
      <div
        class="font-mono uppercase"
        :style="{
          padding: '6px 12px 4px',
          fontSize: '9.5px',
          letterSpacing: '0.07em',
          color: 'var(--kind-rules)',
        }"
      >overview · Visión general</div>
      <div
        class="text-fg-muted"
        :style="{
          padding: '0 12px 8px',
          fontSize: '11.5px',
          lineHeight: '1.55',
          whiteSpace: 'pre-wrap',
        }"
      >{{ overview }}</div>
    </div>

    <!-- Grupos de reglas -->
    <div
      v-for="g in groups"
      :key="g.key"
      :style="{ borderTop: '1px solid var(--border-subtle)' }"
    >
      <!-- Etiqueta de categoría -->
      <div
        class="font-mono uppercase"
        :style="{
          padding: '6px 12px 4px',
          fontSize: '9.5px',
          letterSpacing: '0.07em',
          color: 'var(--kind-rules)',
        }"
      >
        {{ g.tag }} · {{ g.label }}
      </div>

      <!-- Items -->
      <ul :style="{ padding: '0 12px 8px', margin: 0, listStyle: 'none' }">
        <li
          v-for="(item, i) in g.items"
          :key="i"
          class="text-fg-muted"
          :style="{
            fontSize: '11.5px',
            lineHeight: 1.55,
            paddingLeft: '10px',
            position: 'relative',
          }"
        >
          <span
            :style="{
              position: 'absolute',
              left: 0,
              top: '6px',
              width: '4px',
              height: '4px',
              borderRadius: '50%',
              background: 'var(--kind-rules)',
              opacity: 0.5,
            }"
          />
          {{ item }}
        </li>
      </ul>
    </div>

    <!-- Otras secciones libres (extensions) -->
    <div
      v-for="[key, content] in extensionEntries"
      :key="key"
      :style="{ borderTop: '1px solid var(--border-subtle)' }"
    >
      <div
        class="font-mono uppercase"
        :style="{
          padding: '6px 12px 4px',
          fontSize: '9.5px',
          letterSpacing: '0.07em',
          color: 'var(--kind-rules)',
        }"
      >{{ formatTitle(key) }}</div>
      <div
        class="text-fg-muted"
        :style="{
          padding: '0 12px 8px',
          fontSize: '11.5px',
          lineHeight: '1.55',
          whiteSpace: 'pre-wrap',
        }"
      >{{ content }}</div>
    </div>

    <!-- Estado vacío -->
    <div
      v-if="groups.length === 0 && !overview && extensionEntries.length === 0"
      class="text-fg-faint font-mono"
      :style="{ padding: '10px 12px', fontSize: '11px', borderTop: '1px solid var(--border-subtle)' }"
    >
      Sin reglas definidas
    </div>
  </div>
</template>
