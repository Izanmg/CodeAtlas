import * as service from './projects.service.js'

export async function getAll(req, res) {
  try {
    const projects = await service.getAll(req.userId)
    res.status(200).json(projects)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

export async function getById(req, res) {
  try {
    const project = await service.getById(req.params.id, req.userId)
    res.status(200).json(project)
  } catch (err) {
    const status = err.message.includes('acceso') ? 403 : 404
    res.status(status).json({ error: err.message })
  }
}

export async function create(req, res) {
  const { name, description } = req.body
  try {
    const project = await service.create(req.userId, { name, description })
    res.status(201).json(project)
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
}

export async function update(req, res) {
  try {
    const project = await service.update(req.params.id, req.userId, req.body)
    res.status(200).json(project)
  } catch (err) {
    const status = err.message.includes('acceso') ? 403 : 400
    res.status(status).json({ error: err.message })
  }
}

export async function remove(req, res) {
  try {
    await service.remove(req.params.id, req.userId)
    res.status(204).send()
  } catch (err) {
    const status = err.message.includes('acceso') ? 403 : 404
    res.status(status).json({ error: err.message })
  }
}
