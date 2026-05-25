/**
 * diagrams.controller.js
 *
 * Capa HTTP del módulo de diagramas. Conecta las peticiones de Express con el
 * service y traduce los resultados/errores a códigos de estado.
 *
 * Mapeo de errores que se repite en casi todas las funciones:
 *   - mensaje con "acceso"     → 403 (el recurso es de otro usuario)
 *   - mensaje que empieza por [ → 400 (error de validación del parser)
 *   - resto                    → 404 o 500 según el caso
 */

import * as service from './diagrams.service.js'
import * as repo   from './diagrams.repository.js'

/**
 * GET /api/diagrams/recent — diagramas más recientes del usuario (para el dashboard).
 * Va directo al repositorio porque no hay reglas de negocio que aplicar.
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
export async function getRecent(req, res) {
  try {
    res.json(await repo.findRecentByUser(req.userId))
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
}

/**
 * GET /api/projects/:projectId/diagrams — lista los diagramas de un proyecto.
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
export async function getByProject(req, res) {
  try {
    const diagrams = await service.getByProject(req.params.projectId, req.userId)
    res.status(200).json(diagrams)
  } catch (err) {
    const status = err.message.includes('acceso') ? 403 : 404
    res.status(status).json({ error: err.message })
  }
}

/**
 * GET /api/diagrams/:id — devuelve un diagrama completo (modelo + layout).
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
export async function getById(req, res) {
  try {
    const diagram = await service.getById(req.params.id, req.userId)
    res.status(200).json(diagram)
  } catch (err) {
    const status = err.message.includes('acceso') ? 403 : 404
    res.status(status).json({ error: err.message })
  }
}

/**
 * POST /api/projects/:projectId/diagrams — genera un diagrama nuevo a partir de
 * los .md subidos. Los archivos llegan como multipart (multer) en memoria y se
 * convierten a { filename, content } antes de pasarlos al service.
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
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

/**
 * PATCH /api/diagrams/:id — actualiza un diagrama. Si se vuelven a subir .md,
 * se reparsean y se regenera el modelo; si no, solo se cambia el nombre.
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
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

/**
 * PATCH /api/diagrams/:id/layout — guarda las posiciones de los nodos del
 * canvas principal. Responde 204 sin cuerpo.
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
export async function saveLayout(req, res) {
  try {
    await service.saveLayout(req.params.id, req.userId, req.body.layout)
    res.status(204).send()
  } catch (err) {
    const status = err.message.includes('acceso') ? 403 : 404
    res.status(status).json({ error: err.message })
  }
}

/**
 * PATCH /api/diagrams/:id/modules/:moduleId/layout — guarda las posiciones de
 * los nodos del deep-dive de un módulo concreto. Responde 204 sin cuerpo.
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
export async function saveModuleLayout(req, res) {
  try {
    await service.saveModuleLayout(
      req.params.id,
      req.userId,
      req.params.moduleId,
      req.body.layout
    )
    res.status(204).send()
  } catch (err) {
    const status = err.message.includes('acceso') ? 403 : 404
    res.status(status).json({ error: err.message })
  }
}

/**
 * DELETE /api/diagrams/:id — borra un diagrama. Responde 204 sin cuerpo.
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
export async function remove(req, res) {
  try {
    await service.remove(req.params.id, req.userId)
    res.status(204).send()
  } catch (err) {
    const status = err.message.includes('acceso') ? 403 : 404
    res.status(status).json({ error: err.message })
  }
}
