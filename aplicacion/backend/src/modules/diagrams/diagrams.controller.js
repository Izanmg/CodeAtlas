import * as service from './diagrams.service.js'
import * as repo   from './diagrams.repository.js'

export async function getRecent(req, res) {
  try {
    res.json(await repo.findRecentByUser(req.userId))
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
}

export async function getByProject(req, res) {
  try {
    const diagrams = await service.getByProject(req.params.projectId, req.userId)
    res.status(200).json(diagrams)
  } catch (err) {
    const status = err.message.includes('acceso') ? 403 : 404
    res.status(status).json({ error: err.message })
  }
}

export async function getById(req, res) {
  try {
    const diagram = await service.getById(req.params.id, req.userId)
    res.status(200).json(diagram)
  } catch (err) {
    const status = err.message.includes('acceso') ? 403 : 404
    res.status(status).json({ error: err.message })
  }
}

export async function generate(req, res) {
  if (!req.files?.length)
    return res.status(400).json({ error: 'Se requiere al menos un archivo .md' })

  const files = req.files.map(f => ({
    filename: f.originalname,
    content:  f.buffer.toString('utf-8'),
  }))

  try {
    const diagram = await service.generate(
      req.params.projectId,
      req.userId,
      { name: req.body.name, files }
    )
    res.status(201).json(diagram)
  } catch (err) {
    const isValidation = err.message.startsWith('[')
    const status = err.message.includes('acceso') ? 403 : isValidation ? 400 : 500
    res.status(status).json({ error: err.message })
  }
}

export async function update(req, res) {
  const files = (req.files ?? []).map(f => ({
    filename: f.originalname,
    content:  f.buffer.toString('utf-8'),
  }))

  try {
    const diagram = await service.update(req.params.id, req.userId, {
      name: req.body.name,
      files,
    })
    res.status(200).json(diagram)
  } catch (err) {
    const isValidation = err.message.startsWith('[')
    const status = err.message.includes('acceso') ? 403 : isValidation ? 400 : 404
    res.status(status).json({ error: err.message })
  }
}

export async function saveLayout(req, res) {
  try {
    await service.saveLayout(req.params.id, req.userId, req.body.layout)
    res.status(204).send()
  } catch (err) {
    const status = err.message.includes('acceso') ? 403 : 404
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
