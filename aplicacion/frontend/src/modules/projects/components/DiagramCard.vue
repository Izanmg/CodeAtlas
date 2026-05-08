<!--
  DiagramCard.vue

  Tarjeta de diagrama dentro del detalle de proyecto.
-->
<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import Card from '@/components/ui/Card.vue'
import DiagramThumb from './DiagramThumb.vue'
import ConfirmDeleteModal from './ConfirmDeleteModal.vue'
import DiagramEditModal   from './DiagramEditModal.vue'
import { timeAgo } from '../utils/time-format'
import { Trash2, Pencil } from 'lucide-vue-next'

const btnBase = {
  display: 'grid',
  placeItems: 'center',
  width: '26px',
  height: '26px',
  borderRadius: '6px',
  border: 'none',
  background: 'transparent',
  cursor: 'pointer',
  transition: 'background 120ms, color 120ms',
  padding: '0',
  flexShrink: '0',
}

const props = defineProps({
  diagram: { type: Object, required: true },
})

const emit = defineEmits(['deleted', 'updated'])

const router = useRouter()

const showDeleteModal = ref(false)
const showEditModal   = ref(false)
const deleting        = ref(false)

const stats = computed(() => ({
  modules: props.diagram.countModules ?? 0,
  screens: props.diagram.countScreens ?? 0,
  tables:  props.diagram.countTables  ?? 0,
  flows:   props.diagram.countFlows   ?? 0,
}))

function open() {
  if (showDeleteModal.value || showEditModal.value) return
  router.push(`/diagrams/${props.diagram.id}`)
}

function startDelete(e) {
  e.stopPropagation()
  showDeleteModal.value = true
}

function startEdit(e) {
  e.stopPropagation()
  showEditModal.value = true
}

async function confirmDelete() {
  deleting.value = true
  try {
    emit('deleted', props.diagram.id)
  } finally {
    deleting.value = false
    showDeleteModal.value = false
  }
}

function onUpdated(diagram) {
  emit('updated', diagram)
}
</script>

<template>
  <ConfirmDeleteModal
    :open="showDeleteModal"
    title="Borrar diagrama"
    :description="`¿Estás seguro de que quieres borrar «${diagram.name}»? Esta acción no se puede deshacer.`"
    :loading="deleting"
    @close="showDeleteModal = false"
    @confirm="confirmDelete"
  />

  <DiagramEditModal
    :open="showEditModal"
    :diagram="diagram"
    @close="showEditModal = false"
    @updated="onUpdated"
  />

  <div @click="open">
    <Card hoverable :padding="14">
      <div class="flex flex-col" style="gap: 12px;">
        <DiagramThumb />
        <div>
          <h3
            class="text-fg font-semibold m-0"
            :style="{ fontSize: '14px', letterSpacing: '-0.01em', marginBottom: '3px' }"
          >{{ diagram.name }}</h3>
          <p
            class="text-fg-muted m-0"
            :style="{ fontSize: '12.5px', lineHeight: 1.5 }"
          >{{ diagram.description }}</p>
        </div>
        <div
          class="flex items-center font-mono text-fg-subtle"
          :style="{
            paddingTop: '9px',
            borderTop: '1px solid var(--border-subtle)',
            gap: '10px',
            fontSize: '10.5px',
            letterSpacing: '0.02em',
          }"
        >
          <span><b class="text-fg" style="font-weight: 600;">{{ stats.modules }}</b> mod</span>
          <span><b class="text-fg" style="font-weight: 600;">{{ stats.screens }}</b> scr</span>
          <span><b class="text-fg" style="font-weight: 600;">{{ stats.tables }}</b> db</span>
          <span><b class="text-fg" style="font-weight: 600;">{{ stats.flows }}</b> flow</span>

          <div class="ml-auto flex items-center" style="gap: 2px;">
            <span style="margin-right: 6px;">{{ timeAgo(diagram.createdAt) }}</span>
            <button
              title="Editar diagrama"
              class="btn-icon btn-icon--edit"
              :style="btnBase"
              @click="startEdit"
            >
              <Pencil :size="13" />
            </button>
            <button
              title="Borrar diagrama"
              class="btn-icon btn-icon--delete"
              :style="btnBase"
              @click="startDelete"
            >
              <Trash2 :size="13" />
            </button>
          </div>
        </div>
      </div>
    </Card>
  </div>
</template>

<style scoped>
.btn-icon {
  color: var(--fg-faint);
}
.btn-icon--edit:hover {
  background: var(--bg-muted) !important;
  color: var(--fg-muted) !important;
}
.btn-icon--delete:hover {
  background: var(--danger-soft, #fee2e2) !important;
  color: var(--danger, #ef4444) !important;
}
</style>
