/**
 * projects-mock.js
 *
 * Lógica temporal del módulo projects: simula CRUD de proyectos en memoria
 * (con persistencia en localStorage para que sobreviva a recargas).
 *
 * Expone las mismas firmas que tendrá `projects.service.js` cuando se
 * conecte el backend real, así que las vistas y el store no tendrán que
 * cambiar — basta con sustituir el cuerpo de cada función.
 */

import { SEED_PROJECTS } from './seed-projects'

const STORAGE_KEY = 'codeatlas:projects'

let cache = null

/**
 * Devuelve todos los proyectos del usuario (ordenados por updatedAt desc).
 *
 * @returns {Promise<Array<object>>}
 */
export async function fetchAll() {
  await fakeDelay(200)
  ensureLoaded()
  return [...cache].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
}

/**
 * Devuelve un proyecto por id, o null si no existe.
 */
export async function fetchById(id) {
  await fakeDelay(150)
  ensureLoaded()
  return cache.find((p) => p.id === id) ?? null
}

/**
 * Crea un proyecto y devuelve el objeto resultante.
 */
export async function create({ name, description }) {
  await fakeDelay(300)
  ensureLoaded()
  const now = new Date().toISOString()
  const project = {
    id: 'p_' + Math.random().toString(36).slice(2, 9),
    name,
    description: description || '',
    diagramCount: 0,
    createdAt: now,
    updatedAt: now,
  }
  cache.unshift(project)
  persist()
  return project
}

/**
 * Aumenta o decrementa `diagramCount` de un proyecto y actualiza
 * `updatedAt`. Lo llaman las acciones del módulo de diagramas.
 */
export async function bumpDiagramCount(projectId, delta) {
  ensureLoaded()
  const proj = cache.find((p) => p.id === projectId)
  if (!proj) return null
  proj.diagramCount = Math.max(0, proj.diagramCount + delta)
  proj.updatedAt = new Date().toISOString()
  persist()
  return proj
}

// ---- helpers ----

function ensureLoaded() {
  if (cache) return
  if (typeof window === 'undefined') {
    cache = [...SEED_PROJECTS]
    return
  }
  const raw = localStorage.getItem(STORAGE_KEY)
  if (raw) {
    try { cache = JSON.parse(raw); return } catch { /* fallback abajo */ }
  }
  cache = [...SEED_PROJECTS]
  persist()
}

function persist() {
  if (typeof window === 'undefined') return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cache))
}

function fakeDelay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
