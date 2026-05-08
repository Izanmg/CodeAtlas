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

  async function saveLayout(id, layout) {
    await diagramsApi.saveLayout(id, layout)
  }

  async function update(id, payload, onProgress) {
    const diagram = await diagramsApi.update(id, payload, onProgress)
    all.value = all.value.map((d) => d.id === id ? diagram : d)
    if (current.value?.id === id) current.value = diagram
    return diagram
  }

  async function remove(id) {
    await diagramsApi.remove(id)
    all.value = all.value.filter((d) => d.id !== id)
  }

  return { all, loaded, current, fetchAll, fetchByProject, fetchById, generate, update, saveLayout, remove }
})
