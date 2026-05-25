/**
 * diagrams.store.js
 *
 * Store de Pinia para los diagramas. Mantiene la lista de diagramas recientes
 * (`all`) y el diagrama abierto en ese momento (`current`). Su parte más
 * delicada es mantener `current` coherente cuando se guarda un layout, para que
 * volver a entrar al diagrama no descarte las posiciones recién guardadas.
 *
 * Responsabilidad: estado reactivo de los diagramas. Las llamadas HTTP están en
 * diagrams.service.js.
 */

import { defineStore } from 'pinia'
import { ref } from 'vue'
import * as diagramsApi from '../services/diagrams.service'

export const useDiagramsStore = defineStore('diagrams', () => {
  const all = ref([])         // diagramas recientes cacheados
  const loaded = ref(false)   // true una vez cargada la lista, para no recargar de más
  const current = ref(null)   // diagrama abierto actualmente (con modelo + layout)

  /**
   * Trae los diagramas recientes. Devuelve la caché si ya está cargada, salvo
   * que se fuerce con force=true.
   *
   * @param {boolean} [force=false] - Recargar aunque ya esté cargada
   * @returns {Promise<object[]>} Lista de diagramas
   */
  async function fetchAll(force = false) {
    if (loaded.value && !force) return all.value
    all.value = await diagramsApi.fetchAll()
    loaded.value = true
    return all.value
  }

  /**
   * Trae los diagramas de un proyecto concreto (no toca la caché).
   *
   * @param {string} projectId - Id del proyecto
   * @returns {Promise<object[]>} Diagramas del proyecto
   */
  async function fetchByProject(projectId) {
    return await diagramsApi.fetchByProject(projectId)
  }

  /**
   * Trae un diagrama completo y lo deja como `current`.
   *
   * @param {string} id - Id del diagrama
   * @returns {Promise<object>} El diagrama
   */
  async function fetchById(id) {
    const diagram = await diagramsApi.fetchById(id)
    current.value = diagram
    return diagram
  }

  /**
   * Genera un diagrama nuevo, lo añade a la lista y lo deja como `current`.
   *
   * @param {object} payload - { projectId, name, files }
   * @param {Function} [onProgress] - Callback de progreso de la subida
   * @returns {Promise<object>} El diagrama generado
   */
  async function generate(payload, onProgress) {
    const diagram = await diagramsApi.generate(payload, onProgress)
    all.value = [...all.value, diagram]
    current.value = diagram
    return diagram
  }

  /**
   * Guarda el layout del canvas principal y lo refleja en `current`.
   *
   * @param {string} id - Id del diagrama
   * @param {object} layout - Posiciones { [nodeId]: { x, y } }
   * @returns {Promise<void>}
   */
  async function saveLayout(id, layout) {
    await diagramsApi.saveLayout(id, layout)
    // Actualiza el current localmente para que un fetchById no machaque las
    // nuevas posiciones cuando se vuelva a entrar al diagrama.
    if (current.value?.id === id) {
      current.value = {
        ...current.value,
        data: {
          ...current.value.data,
          layout: { ...current.value.data.layout, main: layout },
        },
      }
    }
  }

  /**
   * Guarda el layout del deep-dive de un módulo y lo refleja en `current`,
   * fusionándolo con los layouts de los demás módulos.
   *
   * @param {string} id - Id del diagrama
   * @param {string} moduleId - Id del módulo
   * @param {object} layout - Posiciones { [fileNodeId]: { x, y } }
   * @returns {Promise<void>}
   */
  async function saveModuleLayout(id, moduleId, layout) {
    await diagramsApi.saveModuleLayout(id, moduleId, layout)
    if (current.value?.id === id) {
      const modules = { ...(current.value.data.layout?.modules || {}) }
      modules[moduleId] = layout
      current.value = {
        ...current.value,
        data: {
          ...current.value.data,
          layout: { ...current.value.data.layout, modules },
        },
      }
    }
  }

  /**
   * Actualiza un diagrama y refleja el cambio en la lista y en `current`.
   *
   * @param {string} id - Id del diagrama
   * @param {object} payload - { name, files? }
   * @param {Function} [onProgress] - Callback de progreso
   * @returns {Promise<object>} El diagrama actualizado
   */
  async function update(id, payload, onProgress) {
    const diagram = await diagramsApi.update(id, payload, onProgress)
    all.value = all.value.map((d) => d.id === id ? diagram : d)
    if (current.value?.id === id) current.value = diagram
    return diagram
  }

  /**
   * Borra un diagrama y lo quita de la lista cacheada.
   *
   * @param {string} id - Id del diagrama
   * @returns {Promise<void>}
   */
  async function remove(id) {
    await diagramsApi.remove(id)
    all.value = all.value.filter((d) => d.id !== id)
  }

  return { all, loaded, current, fetchAll, fetchByProject, fetchById, generate, update, saveLayout, saveModuleLayout, remove }
})
