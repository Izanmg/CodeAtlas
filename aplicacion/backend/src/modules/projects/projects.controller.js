/**
 * projects.controller.js
 *
 * Capa HTTP del módulo de proyectos. Recibe las peticiones de Express, llama
 * al service y traduce el resultado o el error a código de estado + JSON.
 *
 * Nota sobre los códigos de error: el service lanza mensajes que incluyen la
 * palabra "acceso" cuando el proyecto pertenece a otro usuario; en ese caso se
 * responde 403, y si simplemente no existe, 404.
 */

import * as service from './projects.service.js'

/**
 * GET /api/projects — lista todos los proyectos del usuario autenticado.
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
export async function getAll(req, res) {
  try {
    const projects = await service.getAll(req.userId)
    res.status(200).json(projects)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

/**
 * GET /api/projects/:id — devuelve un proyecto concreto del usuario.
 * Responde 403 si el proyecto es de otro usuario, 404 si no existe.
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
export async function getById(req, res) {
  try {
    const project = await service.getById(req.params.id, req.userId)
    res.status(200).json(project)
  } catch (err) {
    const status = err.message.includes('acceso') ? 403 : 404
    res.status(status).json({ error: err.message })
  }
}

/**
 * POST /api/projects — crea un proyecto nuevo para el usuario.
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
export async function create(req, res) {
  const { name, description } = req.body
  try {
    const project = await service.create(req.userId, { name, description })
    res.status(201).json(project)
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
}

/**
 * PATCH /api/projects/:id — actualiza nombre/descripción de un proyecto.
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
export async function update(req, res) {
  try {
    const project = await service.update(req.params.id, req.userId, req.body)
    res.status(200).json(project)
  } catch (err) {
    const status = err.message.includes('acceso') ? 403 : 400
    res.status(status).json({ error: err.message })
  }
}

/**
 * DELETE /api/projects/:id — borra un proyecto (responde 204 sin cuerpo).
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
