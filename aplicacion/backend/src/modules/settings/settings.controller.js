/**
 * settings.controller.js
 *
 * Capa HTTP de las preferencias del usuario (por ahora solo el tema claro/oscuro).
 * Recibe la petición, llama al service y devuelve el JSON de ajustes.
 *
 * Responsabilidad: pegamento HTTP. La lógica está en settings.service.js.
 */

import * as service from './settings.service.js'

/**
 * GET /api/settings — devuelve las preferencias del usuario autenticado.
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
export async function getSettings(req, res) {
  try {
    res.json(await service.getSettings(req.userId))
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
}

/**
 * PATCH /api/settings — actualiza las preferencias del usuario y devuelve el
 * resultado ya combinado con las que tenía.
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
export async function updateSettings(req, res) {
  try {
    res.json(await service.updateSettings(req.userId, req.body))
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
}
