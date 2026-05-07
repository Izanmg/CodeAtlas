/**
 * diagrams-mock.js
 *
 * Lógica temporal del módulo de diagramas. Persiste en memoria + localStorage
 * y simula la generación con un retardo escalonado para mostrar la barra
 * de progreso.
 */

import { SEED_DIAGRAMS, CODEATLAS_DIAGRAM_DATA } from './seed-diagrams'

const STORAGE_KEY = 'codeatlas:diagrams'

let cache = null

/**
 * Devuelve todos los diagramas (todos los proyectos).
 */
export async function fetchAll() {
  await fakeDelay(150)
  ensureLoaded()
  return [...cache]
}

/**
 * Devuelve los diagramas asociados a un proyecto.
 */
export async function fetchByProject(projectId) {
  await fakeDelay(150)
  ensureLoaded()
  return cache.filter((d) => d.projectId === projectId)
}

/**
 * Devuelve un diagrama por id.
 */
export async function fetchById(id) {
  await fakeDelay(120)
  ensureLoaded()
  return cache.find((d) => d.id === id) ?? null
}

/**
 * Simula la generación de un diagrama nuevo a partir de archivos `.md`.
 * Devuelve por callback el progreso por fases para mostrar la barra.
 *
 * @param {{ projectId: string, name: string, files: Array<object> }} payload
 * @param {(phase: { progress: number, label: string }) => void} onProgress
 * @returns {Promise<object>} El diagrama creado
 */
export async function generate(payload, onProgress) {
  ensureLoaded()
  const phases = [
    { p: 14, label: 'Subiendo archivos' },
    { p: 38, label: 'Analizando markdown' },
    { p: 64, label: 'Construyendo modelo' },
    { p: 88, label: 'Renderizando diagrama' },
    { p: 100, label: 'Listo' },
  ]
  for (const phase of phases) {
    await fakeDelay(420)
    onProgress?.({ progress: phase.p, label: phase.label })
  }

  // Como aún no hay parser real, devolvemos el modelo de la propia
  // CodeAtlas como "resultado" de la generación.
  const diagram = {
    id: 'd_' + Math.random().toString(36).slice(2, 9),
    projectId: payload.projectId,
    name: payload.name,
    description: 'Diagrama generado a partir de archivos .md',
    createdAt: new Date().toISOString(),
    data: CODEATLAS_DIAGRAM_DATA,
  }
  cache.push(diagram)
  persist()
  return diagram
}

// ---- helpers ----

function ensureLoaded() {
  if (cache) return
  if (typeof window === 'undefined') {
    cache = [...SEED_DIAGRAMS]
    return
  }
  const raw = localStorage.getItem(STORAGE_KEY)
  if (raw) {
    try { cache = JSON.parse(raw); return } catch { /* fallback */ }
  }
  cache = [...SEED_DIAGRAMS]
  persist()
}

function persist() {
  if (typeof window === 'undefined') return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cache))
}

function fakeDelay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
