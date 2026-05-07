import * as repo from './projects.repository.js'

export async function getAll(userId) {
  return repo.findAllByUser(userId)
}

export async function getById(id, userId) {
  const project = await repo.findById(id)
  if (!project) throw new Error('Proyecto no encontrado')
  if (project.user_id !== userId) throw new Error('No tienes acceso a este proyecto')
  return project
}

export async function create(userId, { name, description }) {
  if (!name?.trim()) throw new Error('El nombre del proyecto es obligatorio')
  return repo.create({ userId, name: name.trim(), description })
}

export async function update(id, userId, patch) {
  await getById(id, userId)
  return repo.update(id, patch)
}

export async function remove(id, userId) {
  await getById(id, userId)
  await repo.remove(id)
}
