<!--
  ProjectCard.vue

  Tarjeta de proyecto del dashboard. Click → navega al detalle.
-->
<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useProjectsStore } from '../stores/projects.store'
import Card from '@/components/ui/Card.vue'
import ProjectThumb from './ProjectThumb.vue'
import EmptyThumb from './EmptyThumb.vue'
import ConfirmDeleteModal from './ConfirmDeleteModal.vue'
import ProjectEditModal from './ProjectEditModal.vue'
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
  project: { type: Object, required: true },
})

const router = useRouter()
const projectsStore = useProjectsStore()

const showDeleteModal = ref(false)
const showEditModal   = ref(false)
const deleting        = ref(false)

function open() {
  if (showDeleteModal.value || showEditModal.value) return
  router.push(`/projects/${props.project.id}`)
}

function startEdit(e) {
  e.stopPropagation()
  showEditModal.value = true
}

function startDelete(e) {
  e.stopPropagation()
  showDeleteModal.value = true
}

async function confirmDelete() {
  deleting.value = true
  try {
    await projectsStore.remove(props.project.id)
  } finally {
    deleting.value = false
    showDeleteModal.value = false
  }
}
</script>

<template>
  <ConfirmDeleteModal
    :open="showDeleteModal"
    title="Borrar proyecto"
    :description="`¿Estás seguro de que quieres borrar «${project.name}»? Esta acción no se puede deshacer.`"
    :loading="deleting"
    @close="showDeleteModal = false"
    @confirm="confirmDelete"
  />

  <ProjectEditModal
    :open="showEditModal"
    :project="project"
    @close="showEditModal = false"
  />

  <div @click="open">
    <Card hoverable :padding="14">
      <div class="flex flex-col" style="gap: 12px;">
        <ProjectThumb v-if="project.diagramCount > 0" :project="project" />
        <EmptyThumb v-else />
        <div>
          <div class="flex items-center" style="gap: 6px; margin-bottom: 3px;">
            <h3
              class="text-fg font-semibold m-0 flex-1 whitespace-nowrap overflow-hidden text-ellipsis"
              style="font-size: 14px; letter-spacing: -0.01em;"
            >{{ project.name }}</h3>
            <span v-if="project.pinned" class="text-accent flex">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L9 9 2 9 7 14 5 22 12 18 19 22 17 14 22 9 15 9z" />
              </svg>
            </span>
          </div>
          <p
            class="text-fg-muted m-0"
            :style="{
              fontSize: '12.5px',
              lineHeight: '1.5',
              display: '-webkit-box',
              '-webkit-line-clamp': '2',
              '-webkit-box-orient': 'vertical',
              overflow: 'hidden',
              minHeight: '36px',
            }"
          >{{ project.description }}</p>
        </div>

        <div
          class="flex justify-between items-center font-mono text-fg-subtle"
          :style="{
            paddingTop: '9px',
            borderTop: '1px solid var(--border-subtle)',
            fontSize: '10.5px',
            letterSpacing: '0.02em',
          }"
        >
          <span>
            {{ project.diagramCount }} {{ project.diagramCount === 1 ? 'diagrama' : 'diagramas' }}
          </span>

          <div class="flex items-center" style="gap: 2px;">
            <span style="margin-right: 6px;">{{ timeAgo(project.updatedAt) }}</span>
            <button
              title="Editar proyecto"
              class="btn-icon btn-icon--edit"
              :style="btnBase"
              @click="startEdit"
            >
              <Pencil :size="13" />
            </button>
            <button
              :title="project.diagramCount > 0 ? 'Borra todos los diagramas primero' : 'Borrar proyecto'"
              class="btn-icon btn-icon--delete"
              :style="{ ...btnBase, opacity: project.diagramCount > 0 ? 0.3 : 1, cursor: project.diagramCount > 0 ? 'not-allowed' : 'pointer' }"
              :disabled="project.diagramCount > 0"
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
.btn-icon--delete:not(:disabled):hover {
  background: var(--danger-soft, #fee2e2) !important;
  color: var(--danger, #ef4444) !important;
}
</style>
