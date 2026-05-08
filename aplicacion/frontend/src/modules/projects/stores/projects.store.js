import { defineStore } from 'pinia'
import { ref } from 'vue'
import * as projectsApi from '../services/projects.service'

export const useProjectsStore = defineStore('projects', () => {
  const projects = ref([])
  const loading = ref(false)
  const loaded = ref(false)

  async function fetchAll(force = false) {
    if (loaded.value && !force) return projects.value
    loading.value = true
    try {
      projects.value = await projectsApi.fetchAll()
      loaded.value = true
      return projects.value
    } finally {
      loading.value = false
    }
  }

  async function fetchById(id) {
    return await projectsApi.fetchById(id)
  }

  async function create(payload) {
    const project = await projectsApi.create(payload)
    projects.value = [project, ...projects.value]
    return project
  }

  async function bumpDiagramCount(projectId, delta) {
    const updated = await projectsApi.bumpDiagramCount(projectId, delta)
    if (updated) {
      // Refresca la lista local con el proyecto actualizado.
      projects.value = projects.value.map((p) => (p.id === projectId ? updated : p))
    }
    return updated
  }

  async function update(id, patch) {
    const project = await projectsApi.update(id, patch)
    projects.value = projects.value.map((p) => (p.id === id ? project : p))
    return project
  }

  async function remove(id) {
    await projectsApi.remove(id)
    projects.value = projects.value.filter((p) => p.id !== id)
  }

  return { projects, loading, loaded, fetchAll, fetchById, create, bumpDiagramCount, update, remove }
})
