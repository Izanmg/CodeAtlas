<!--
  DashboardView.vue

  Vista principal del usuario autenticado. Muestra:
    - Cabecera con saludo + filtro + botón "Nuevo proyecto"
    - Strip de 4 stats globales
    - Sección "Fijados" (proyectos pinned)
    - Sección "Todos los proyectos"
    - Lista de "Diagramas recientes"

  Los datos provienen de los stores de proyectos y diagramas. El módulo
  dashboard no tiene su propia capa de datos — solo compone los otros.
-->
<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useProjectsStore } from '@/modules/projects/stores/projects.store'
import { useDiagramsStore } from '@/modules/diagrams/stores/diagrams.store'
import { useAuthStore } from '@/modules/auth/stores/auth.store'

import AppShell from '@/components/layout/AppShell.vue'
import PageHeader from '@/components/ui/PageHeader.vue'
import Input from '@/components/ui/Input.vue'
import Button from '@/components/ui/Button.vue'
import Modal from '@/components/ui/Modal.vue'
import Field from '@/components/ui/Field.vue'
import Textarea from '@/components/ui/Textarea.vue'

import StatCell from '@/modules/projects/components/StatCell.vue'
import SectionLabel from '@/modules/projects/components/SectionLabel.vue'
import ProjectCard from '@/modules/projects/components/ProjectCard.vue'
import { timeAgo } from '@/modules/projects/utils/time-format'

import { Plus, Search, Folder, Network, AlertCircle, ArrowRight, Bot } from 'lucide-vue-next'

const router = useRouter()
const projectsStore = useProjectsStore()
const diagramsStore = useDiagramsStore()
const authStore = useAuthStore()

const filter = ref('')
const newProjectOpen = ref(false)
const newName = ref('')
const newDesc = ref('')

onMounted(async () => {
  // force=true: el dashboard siempre carga datos frescos al entrar. El cache
  // por `loaded` no se invalida al cambiar de sesión, así que sin esto la lista
  // quedaba vacía/desactualizada hasta recargar la página.
  await Promise.all([
    projectsStore.fetchAll(true),
    diagramsStore.fetchAll(true),
  ])
})

const filteredProjects = computed(() => {
  const q = filter.value.toLowerCase().trim()
  if (!q) return projectsStore.projects
  return projectsStore.projects.filter(
    (p) =>
      p.name.toLowerCase().includes(q) ||
      (p.description || '').toLowerCase().includes(q)
  )
})

const pinned = computed(() => filteredProjects.value.filter((p) => p.pinned))
const rest = computed(() => filteredProjects.value.filter((p) => !p.pinned))

const recent = computed(() =>
  [...diagramsStore.all]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 3)
)

const firstName = computed(() => authStore.user?.name?.split(' ')[0] || '')

function findProject(id) {
  return projectsStore.projects.find((p) => p.id === id)
}

async function createProject() {
  if (!newName.value.trim()) return
  const project = await projectsStore.create({
    name: newName.value.trim(),
    description: newDesc.value.trim(),
  })
  newProjectOpen.value = false
  newName.value = ''
  newDesc.value = ''
  router.push(`/projects/${project.id}`)
}

function openDiagram(d) {
  router.push(`/diagrams/${d.id}`)
}
</script>

<template>
  <AppShell>
    <div class="px-4 sm:px-8 pt-6 sm:pt-8 pb-16" style="max-width: 1240px; margin: 0 auto;">
      <PageHeader
        :eyebrow="`hola, ${firstName.toLowerCase()}`"
        title="Tus proyectos"
        description="Cada proyecto agrupa los diagramas generados a partir de tu documentación markdown."
      >
        <template #actions>
          <div class="w-full sm:w-[220px]">
            <Input v-model="filter" placeholder="Filtrar proyectos…">
              <template #icon><Search :size="14" /></template>
            </Input>
          </div>
          <Button variant="secondary" @click="router.push('/bot')">
            <template #icon><Bot :size="14" /></template>
            Asistente IA
          </Button>
          <Button variant="primary" @click="newProjectOpen = true">
            <template #icon><Plus :size="14" /></template>
            Nuevo proyecto
          </Button>
        </template>
      </PageHeader>

      <!-- Strip de stats -->
      <div
        class="bg-surface rounded-lg overflow-hidden grid grid-cols-1 sm:grid-cols-3"
        :style="{ border: '1px solid var(--border)', marginBottom: '28px' }"
      >
        <StatCell
          label="Proyectos"
          :value="projectsStore.projects.length"
          icon-color="var(--accent)"
        >
          <template #icon><Folder :size="15" /></template>
        </StatCell>
        <StatCell
          label="Diagramas"
          :value="projectsStore.projects.reduce((s, p) => s + (p.diagramCount || 0), 0)"
          icon-color="var(--kind-backend)"
        >
          <template #icon><Network :size="15" /></template>
        </StatCell>
        <StatCell
          label="Última actividad"
          :value="projectsStore.projects[0] ? timeAgo(projectsStore.projects[0].updatedAt) : '—'"
          icon-color="var(--kind-flow)"
        >
          <template #icon><AlertCircle :size="15" /></template>
        </StatCell>
      </div>

      <template v-if="pinned.length > 0">
        <SectionLabel :count="pinned.length">Fijados</SectionLabel>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" style="gap: 14px;">
          <ProjectCard
            v-for="p in pinned"
            :key="p.id"
            :project="p"
          />
        </div>
      </template>

      <template v-if="rest.length > 0">
        <SectionLabel
          :count="rest.length"
          :style="{ marginTop: pinned.length ? '28px' : '0' }"
        >Todos los proyectos</SectionLabel>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" style="gap: 14px;">
          <ProjectCard
            v-for="p in rest"
            :key="p.id"
            :project="p"
          />
        </div>
      </template>

      <template v-if="recent.length > 0">
        <SectionLabel :style="{ marginTop: '32px' }">Diagramas recientes</SectionLabel>
        <div
          class="bg-surface rounded-lg overflow-hidden"
          :style="{ border: '1px solid var(--border)' }"
        >
          <button
            v-for="(d, i) in recent"
            :key="d.id"
            class="w-full flex items-center text-left hover:bg-bg-subtle transition-colors duration-100"
            :style="{
              padding: '10px 14px',
              gap: '12px',
              borderTop: i > 0 ? '1px solid var(--border-subtle)' : 'none',
            }"
            @click="openDiagram(d)"
          >
            <div
              class="grid place-items-center bg-accent-soft text-accent rounded-sm flex-shrink-0"
              :style="{ width: '28px', height: '28px' }"
            >
              <Network :size="14" />
            </div>
            <div class="min-w-0 flex-1">
              <div class="text-fg font-medium" style="font-size: 13px;">{{ d.name }}</div>
              <div class="text-fg-subtle" style="font-size: 11.5px;">
                <span class="font-mono">{{ findProject(d.projectId)?.name }}</span>
                · {{ timeAgo(d.createdAt) }}
              </div>
            </div>
            <ArrowRight :size="13" class="text-fg-faint" />
          </button>
        </div>
      </template>

      <div
        v-if="filteredProjects.length === 0"
        class="bg-surface text-fg-muted rounded-md text-center"
        :style="{
          padding: '60px',
          border: '1px dashed var(--border-strong)',
        }"
      >
        No hay proyectos que coincidan con
        <span class="mono text-fg">"{{ filter }}"</span>.
      </div>
    </div>

    <Modal
      :open="newProjectOpen"
      title="Nuevo proyecto"
      @close="newProjectOpen = false"
    >
      <div class="flex flex-col" style="gap: 14px;">
        <Field label="Nombre del proyecto" htmlFor="np-name">
          <Input
            id="np-name"
            v-model="newName"
            placeholder="ej. Lumen Analytics"
            autofocus
          />
        </Field>
        <Field label="Descripción" htmlFor="np-desc" optional>
          <Textarea
            id="np-desc"
            v-model="newDesc"
            placeholder="¿Qué es este proyecto? Una frase es suficiente."
            :rows="3"
          />
        </Field>
      </div>
      <template #footer>
        <Button variant="ghost" @click="newProjectOpen = false">Cancelar</Button>
        <Button
          variant="primary"
          :disabled="!newName.trim()"
          @click="createProject"
        >Crear proyecto</Button>
      </template>
    </Modal>
  </AppShell>
</template>
