import { defineStore } from 'pinia'
import { ref } from 'vue'
import * as diagramsApi from '../services/diagrams.service'

export const useDiagramsStore = defineStore('diagrams', () => {
  const all = ref([])
  const loaded = ref(false)
  const current = ref(null)

  async function fetchAll(force = false) {
    if (loaded.value && !force) return all.value
    all.value = await diagramsApi.fetchAll()
    loaded.value = true
    return all.value
  }

  async function fetchByProject(projectId) {
    return await diagramsApi.fetchByProject(projectId)
  }

  async function fetchById(id) {
    const diagram = await diagramsApi.fetchById(id)
    current.value = diagram
    return diagram
  }

  async function generate(payload, onProgress) {
    const diagram = await diagramsApi.generate(payload, onProgress)
    all.value = [...all.value, diagram]
    current.value = diagram
    return diagram
  }

  return { all, loaded, current, fetchAll, fetchByProject, fetchById, generate }
})
