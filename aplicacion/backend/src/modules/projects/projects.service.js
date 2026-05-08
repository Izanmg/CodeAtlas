import * as repo from './projects.repository.js'

export async function getAll(userId) {
  return repo.findAllByUser(userId)
}

export async function getById(id, userId) {
  const project = await repo.findById(id, userId)
  if (!project) throw new Error('Proyecto no encontrado')
  return project
}

export async function create(userId, { name, description }) {
  if (!name?.trim()) throw new Error('El nombre del proyecto es obligatorio')
  return repo.create({ userId, name: name.trim(), description })
}

export async function update(id, userId, patch) {
  const updated = await repo.update(id, userId, patch)
  if (!updated) throw new Error('Proyecto no encontrado')
  return updated
}

export async function remove(id, userId) {
  const project = await getById(id, userId)
  if (Number(project.diagram_count) > 0)
    throw new Error('El proyecto tiene diagramas. Bórralos primero.')
  await repo.remove(id, userId)
}
