<!--
  FileNode.vue

  Nodo UML del deep-dive de un módulo. Estructura simple:
    - Cabecera con icono + path + badge de tipo. Si hay `role` o funciones
      con `doc`, aparece un punto accent indicando que hay info adicional.
    - Cuerpo con la lista de firmas de funciones (solo nombres).

  Al hacer click, el ModuleDeepDiveView abre el SidePanel a la derecha
  con role + funciones desplegables + conexiones (gestionado por el panel).
-->
<script setup>
import { computed } from 'vue'
import NodeHandles from './NodeHandles.vue'
import { FileText } from 'lucide-vue-next'

defineOptions({ inheritAttrs: false })

const props = defineProps({
  data: { type: Object, required: true },
  selected: { type: Boolean, default: false },
})

const hasDocs = computed(() => {
  if (props.data.role) return true
  return (props.data.functions || []).some(
    (fn) => typeof fn !== 'string' && fn.doc,
  )
})

function fnSignature(fn) {
  return typeof fn === 'string' ? fn : fn.signature
}
</script>

<template>
  <NodeHandles />
  <div
    class="rounded-md overflow-hidden font-sans cursor-pointer transition-all duration-100"
    :style="{
      width: data.width + 'px',
      background: 'var(--surface)',
      border: `1px solid ${selected ? 'var(--accent)' : 'var(--border)'}`,
      borderLeft: `3px solid ${data.folderColor || 'var(--border)'}`,
      boxShadow: selected
        ? '0 0 0 3px var(--accent-soft), var(--shadow-md)'
        : 'var(--shadow-sm)',
    }"
  >
    <!-- Cabecera -->
    <div
      class="flex items-center"
      :style="{
        padding: '8px 11px',
        gap: '8px',
        borderBottom: '1px solid var(--border-subtle)',
      }"
    >
      <FileText
        :size="13"
        class="flex-shrink-0"
        :style="{ color: data.folderColor || 'var(--fg-muted)' }"
      />
      <div class="text-fg font-mono font-semibold flex-1 truncate" style="font-size: 12px;">
        {{ data.path }}
      </div>
      <span
        v-if="hasDocs"
        title="Tiene notas — abre el panel para verlas"
        :style="{
          width: '6px',
          height: '6px',
          borderRadius: '50%',
          background: 'var(--accent)',
          flexShrink: 0,
        }"
      />
      <span
        v-if="data.fileType"
        class="font-mono uppercase rounded text-fg-subtle bg-bg-muted"
        :style="{
          fontSize: '9px',
          letterSpacing: '0.06em',
          padding: '2px 6px',
        }"
      >{{ data.fileType }}</span>
    </div>

    <!-- Lista de funciones (solo firmas, sin expandir) -->
    <div
      v-if="data.functions?.length"
      class="flex flex-col"
      :style="{ background: 'var(--bg-subtle)' }"
    >
      <div
        v-for="(fn, i) in data.functions"
        :key="i"
        class="text-fg-muted font-mono"
        :style="{
          padding: '4px 11px',
          fontSize: '11px',
          lineHeight: '1.4',
          borderTop: i > 0 ? '1px solid var(--border-subtle)' : 'none',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }"
      >
        <span class="text-fg-faint" style="margin-right: 5px;">›</span>{{ fnSignature(fn) }}
      </div>
    </div>

    <!-- Estado vacío -->
    <div
      v-else
      class="text-fg-faint font-mono italic"
      :style="{ padding: '6px 11px', fontSize: '10.5px', background: 'var(--bg-subtle)' }"
    >sin funciones documentadas</div>
  </div>
</template>
