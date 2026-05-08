import * as repo from './diagrams.repository.js'
import * as projectsRepo from '../projects/projects.repository.js'
import { parseDocumentation } from '../parser/parser.service.js'

/**
 * Cada operación del servicio recibe un `userId` que se propaga al repositorio.
 * El repositorio aplica el filtro WHERE user_id = ? en todas las queries, así
 * que un diagrama de otro usuario simplemente "no existe" desde la perspectiva
 * del servicio (devuelve null o no afecta filas).
 *
 * `verifyProjectAccess` solo es necesaria en `generate`, donde estamos creando
 * un diagrama nuevo y hay que confirmar que el proyecto destino pertenece al
 * usuario antes del INSERT.
 */
async function verifyProjectAccess(projectId, userId) {
  const project = await projectsRepo.findById(projectId, userId)
  if (!project) throw new Error('Proyecto no encontrado')
  return project
}

export async function getByProject(projectId, userId) {
  await verifyProjectAccess(projectId, userId)
  return repo.findByProject(projectId, userId)
}

export async function getById(id, userId) {
  const diagram = await repo.findById(id, userId)
  if (!diagram) throw new Error('Diagrama no encontrado')
  return diagram
}

export async function generate(projectId, userId, { name, files }) {
  await verifyProjectAccess(projectId, userId)
  if (!name?.trim()) throw new Error('El nombre del diagrama es obligatorio')
  if (!files?.length) throw new Error('Se requiere al menos un archivo .md')

  const { model, layout } = await parseDocumentation(files)
  return repo.create({ projectId, userId, name: name.trim(), model, layout })
}

export async function update(id, userId, { name, files }) {
  const diagram = await repo.findById(id, userId)
  if (!diagram) throw new Error('Diagrama no encontrado')
  if (!name?.trim()) throw new Error('El nombre del diagrama es obligatorio')

  let model, layout
  if (files?.length) {
    const parsed = await parseDocumentation(files)
    model = parsed.model
    layout = parsed.layout
  }

  return repo.update(id, userId, {
    name: name.trim(),
    description: diagram.description ?? null,
    ...(model !== undefined ? { model, layout } : {}),
  })
}

export async function saveLayout(id, userId, layout) {
  const ok = await repo.updateLayout(id, userId, layout)
  if (!ok) throw new Error('Diagrama no encontrado')
}

export async function remove(id, userId) {
  const ok = await repo.remove(id, userId)
  if (!ok) throw new Error('Diagrama no encontrado')
}
