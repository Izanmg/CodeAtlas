<!--
  ProjectDetailView.vue

  Vista de un proyecto concreto. Header con su nombre + descripción,
  strip de stats y la lista de diagramas. Si el proyecto no tiene
  diagramas todavía muestra un EmptyState con CTA a "Subir documentación".
-->
<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useProjectsStore } from '../stores/projects.store'
import { useDiagramsStore } from '@/modules/diagrams/stores/diagrams.store'

import AppShell from '@/components/layout/AppShell.vue'
import PageHeader from '@/components/ui/PageHeader.vue'
import Button from '@/components/ui/Button.vue'

import StatCell from '../components/StatCell.vue'
import SectionLabel from '../components/SectionLabel.vue'
import EmptyState from '../components/EmptyState.vue'
import DiagramCard from '../components/DiagramCard.vue'

import { timeAgo, fullDate } from '../utils/time-format'
import { Plus, Upload, Network, AlertCircle, Folder } from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()
const projectsStore = useProjectsStore()
const diagramsStore = useDiagramsStore()

const project = ref(null)
const diagrams = ref([])

onMounted(async () => {
  const id = route.params.id
  project.value = await projectsStore.fetchById(id)
  if (!project.value) {
    router.push('/')
    return
  }
  diagrams.value = await diagramsStore.fetchByProject(id)
})

const breadcrumbs = computed(() => [
  { label: 'Proyectos', to: '/' },
  { label: project.value?.name || '…' },
])

function newDiagram() {
  router.push(`/projects/${project.value.id}/diagrams/new`)
}
</script>

<template>
  <AppShell :breadcrumbs="breadcrumbs">
    <div
      v-if="project"
      class="px-4 sm:px-8 pt-6 sm:pt-8 pb-16"
      style="max-width: 1240px; margin: 0 auto;"
    >
      <PageHeader
        :title="project.name"
        :description="project.description"
      >
        <template #eyebrow>
          <span class="mono">{{ project.id }}</span>
        </template>
        <template #actions>
          <Button variant="primary" @click="newDiagram">
            <template #icon><Plus :size="14" /></template>
            Nuevo diagrama
          </Button>
        </template>
      </PageHeader>

      <div
        class="bg-surface rounded-lg overflow-hidden grid grid-cols-1 sm:grid-cols-3"
        :style="{ border: '1px solid var(--border)', marginBottom: '28px' }"
      >
        <StatCell label="Diagramas" :value="diagrams.length" icon-color="var(--kind-backend)">
          <template #icon><Network :size="15" /></template>
        </StatCell>
        <StatCell
          label="Última modif."
          :value="timeAgo(project.updatedAt)"
          icon-color="var(--kind-flow)"
        >
          <template #icon><AlertCircle :size="15" /></template>
        </StatCell>
        <StatCell
          label="Creado"
          :value="fullDate(project.createdAt)"
          icon-color="var(--accent)"
        >
          <template #icon><Folder :size="15" /></template>
        </StatCell>
      </div>

      <SectionLabel :count="diagrams.length">Diagramas</SectionLabel>

      <EmptyState v-if="diagrams.length === 0">
        <template #icon><Upload :size="20" /></template>
        <template #title>Aún no hay diagramas</template>
        <template #description>
          Sube tus archivos .md de documentación para generar el primer
          diagrama de este proyecto.
        </template>
        <template #action>
          <Button variant="primary" @click="newDiagram">
            <template #icon><Upload :size="14" /></template>
            Subir documentación
          </Button>
        </template>
      </EmptyState>

      <div
        v-else
        class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
        style="gap: 14px;"
      >
        <DiagramCard
          v-for="d in diagrams"
          :key="d.id"
          :diagram="d"
        />
      </div>
    </div>
  </AppShell>
</template>
