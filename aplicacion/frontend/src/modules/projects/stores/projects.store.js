/**
 * projects.store.js
 *
 * Store de Pinia que cachea la lista de proyectos del usuario y la mantiene
 * sincronizada al crear, actualizar o borrar. Sirve de fuente única para que el
 * dashboard y las vistas de detalle no tengan que recargar de la API cada vez.
 *
 * Responsabilidad: estado reactivo de los proyectos. Las llamadas HTTP están en
 * projects.service.js.
 */

import { defineStore } from 'pinia'
import { ref } from 'vue'
import * as projectsApi from '../services/projects.service'

export const useProjectsStore = defineStore('projects', () => {
  const projects = ref([])   // lista cacheada de proyectos
  const loading = ref(false) // true mientras se está trayendo la lista
  const loaded = ref(false)  // true una vez cargada, para no recargar de más

  /**
   * Trae la lista de proyectos. Si ya está cargada, devuelve la caché salvo que
   * se fuerce con force=true (por ejemplo tras un cambio que la invalide).
   *
   * @param {boolean} [force=false] - Recargar aunque ya esté cargada
   * @returns {Promise<object[]>} Lista de proyectos
   */
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

  /**
   * Trae un proyecto por id directamente de la API (no toca la caché).
   *
   * @param {string} id - Id del proyecto
   * @returns {Promise<object>} El proyecto
   */
  async function fetchById(id) {
    return await projectsApi.fetchById(id)
  }

  /**
   * Crea un proyecto y lo añade al principio de la lista cacheada.
   *
   * @param {{name: string, description?: string}} payload
   * @returns {Promise<object>} El proyecto creado
   */
  async function create(payload) {
    const project = await projectsApi.create(payload)
    projects.value = [project, ...projects.value]
    return project
  }

  /**
   * Refresca el contador de diagramas de un proyecto y actualiza su entrada en
   * la lista cacheada. Se llama tras crear o borrar un diagrama.
   *
   * @param {string} projectId - Id del proyecto a refrescar
   * @param {number} delta - Variación del contador (se delega en la API)
   * @returns {Promise<object>} El proyecto actualizado
   */
  async function bumpDiagramCount(projectId, delta) {
    const updated = await projectsApi.bumpDiagramCount(projectId, delta)
    if (updated) {
      // Refresca la lista local con el proyecto actualizado.
      projects.value = projects.value.map((p) => (p.id === projectId ? updated : p))
    }
    return updated
  }

  /**
   * Actualiza un proyecto y refleja el cambio en la lista cacheada.
   *
   * @param {string} id - Id del proyecto
   * @param {object} patch - Campos a actualizar
   * @returns {Promise<object>} El proyecto actualizado
   */
  async function update(id, patch) {
    const project = await projectsApi.update(id, patch)
    projects.value = projects.value.map((p) => (p.id === id ? project : p))
    return project
  }

  /**
   * Borra un proyecto y lo quita de la lista cacheada.
   *
   * @param {string} id - Id del proyecto
   * @returns {Promise<void>}
   */
  async function remove(id) {
    await projectsApi.remove(id)
    projects.value = projects.value.filter((p) => p.id !== id)
  }

  return { projects, loading, loaded, fetchAll, fetchById, create, bumpDiagramCount, update, remove }
})
