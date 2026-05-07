import * as repo from './diagrams.repository.js'
import * as projectsRepo from '../projects/projects.repository.js'
import { parseDocumentation } from '../parser/parser.service.js'

async function verifyProjectAccess(projectId, userId) {
  const project = await projectsRepo.findById(projectId)
  if (!project) throw new Error('Proyecto no encontrado')
  if (project.user_id !== userId) throw new Error('No tienes acceso a este proyecto')
  return project
}

export async function getByProject(projectId, userId) {
  await verifyProjectAccess(projectId, userId)
  return repo.findByProject(projectId)
}

export async function getById(id, userId) {
  const diagram = await repo.findById(id)
  if (!diagram) throw new Error('Diagrama no encontrado')
  await verifyProjectAccess(diagram.project_id, userId)
  return diagram
}

export async function generate(projectId, userId, { name, files }) {
  await verifyProjectAccess(projectId, userId)
  if (!name?.trim()) throw new Error('El nombre del diagrama es obligatorio')
  if (!files?.length) throw new Error('Se requiere al menos un archivo .md')

  const { model, layout } = await parseDocumentation(files)
  return repo.create({ projectId, name: name.trim(), model, layout })
}

export async function remove(id, userId) {
  await getById(id, userId)
  await repo.remove(id)
}
