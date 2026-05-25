/**
 * bot.controller.js
 *
 * Capa HTTP del módulo bot. Todos los endpoints requieren `req.userId`
 * inyectado por el middleware `requireAuth`. Los endpoints que operan
 * sobre una sesión concreta reciben el `sessionId` por path param.
 */

import * as service from './bot.service.js'
import { buildZip } from './bot.zip.js'

/**
 * Traduce un error del service a una respuesta HTTP. Distingue tres casos por
 * el prefijo del mensaje: cuota agotada (429 con info para cambiar de modelo),
 * error del usuario (400) o fallo interno (500).
 *
 * @param {import('express').Response} res
 * @param {Error} err - Error lanzado por el service
 */
function sendError(res, err) {
  // Errores de cuota → 429 con info estructurada para que el frontend
  // pueda ofrecer cambiar de modelo automáticamente.
  if (err.message.startsWith('[bot:quota]')) {
    return res.status(429).json({
      error: err.message.replace('[bot:quota] ', ''),
      code: 'QUOTA_EXCEEDED',
      model: err.model || null,
      suggestedModel: err.suggestedModel || null,
    })
  }
  const isUserError = err.message.startsWith('[bot]')
  res.status(isUserError ? 400 : 500).json({ error: err.message })
}

/**
 * GET /api/bot/sessions — lista las sesiones de chat del usuario.
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
export async function getSessions(req, res) {
  try {
    const sessions = await service.listSessions(req.userId)
    res.status(200).json({ sessions })
  } catch (err) {
    sendError(res, err)
  }
}

/**
 * POST /api/bot/sessions — crea una sesión de chat nueva.
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
export async function createSession(req, res) {
  try {
    const session = await service.createSession(req.userId)
    res.status(201).json(session)
  } catch (err) {
    sendError(res, err)
  }
}

/**
 * GET /api/bot/sessions/:sessionId — devuelve el estado de una sesión.
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
export async function getSession(req, res) {
  try {
    const state = await service.getSessionState(req.params.sessionId, req.userId)
    res.status(200).json(state)
  } catch (err) {
    sendError(res, err)
  }
}

/**
 * PATCH /api/bot/sessions/:sessionId — renombra una sesión. Responde 204.
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
export async function patchSession(req, res) {
  const { title } = req.body
  if (!title) return res.status(400).json({ error: 'title es obligatorio' })
  try {
    await service.renameSession(req.params.sessionId, req.userId, title)
    res.status(204).end()
  } catch (err) {
    sendError(res, err)
  }
}

/**
 * DELETE /api/bot/sessions/:sessionId — borra una sesión. Responde 204.
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
export async function deleteSession(req, res) {
  try {
    await service.deleteSession(req.params.sessionId, req.userId)
    res.status(204).end()
  } catch (err) {
    sendError(res, err)
  }
}

/**
 * POST /api/bot/sessions/:sessionId/message — envía un mensaje al bot y devuelve
 * su respuesta junto a los archivos generados.
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
export async function postMessage(req, res) {
  const { message, model } = req.body
  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'message es obligatorio' })
  }
  try {
    const result = await service.processMessage(req.params.sessionId, req.userId, message, model)
    res.status(200).json(result)
  } catch (err) {
    sendError(res, err)
  }
}

/**
 * GET /api/bot/sessions/:sessionId/files — lista los archivos generados.
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
export async function getFilesList(req, res) {
  try {
    const files = await service.listFiles(req.params.sessionId, req.userId)
    res.status(200).json({ files })
  } catch (err) {
    sendError(res, err)
  }
}

/**
 * DELETE /api/bot/sessions/:sessionId/files?path=... — borra un archivo generado.
 * Responde 204, o 404 si el archivo no existía.
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
export async function deleteOneFile(req, res) {
  const filePath = req.query.path
  if (!filePath) {
    return res.status(400).json({ error: 'query param "path" es obligatorio' })
  }
  try {
    const removed = await service.removeFile(req.params.sessionId, req.userId, filePath)
    if (!removed) return res.status(404).json({ error: 'Archivo no encontrado' })
    res.status(204).end()
  } catch (err) {
    sendError(res, err)
  }
}

/**
 * GET /api/bot/sessions/:sessionId/zip — descarga en .zip todos los archivos
 * generados en la sesión. Responde 404 si todavía no hay archivos.
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
export async function downloadZip(req, res) {
  try {
    const buffer = await buildZip(req.params.sessionId, req.userId)
    if (!buffer) {
      return res.status(404).json({ error: 'No hay archivos generados todavía' })
    }
    res.setHeader('Content-Type', 'application/zip')
    res.setHeader('Content-Disposition', 'attachment; filename="app-doc.zip"')
    res.send(buffer)
  } catch (err) {
    sendError(res, err)
  }
}
