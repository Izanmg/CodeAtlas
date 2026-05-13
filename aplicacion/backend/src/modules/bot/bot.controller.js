/**
 * bot.controller.js
 *
 * Capa HTTP del módulo bot. Todos los endpoints requieren `req.userId`
 * inyectado por el middleware `requireAuth`. Los endpoints que operan
 * sobre una sesión concreta reciben el `sessionId` por path param.
 */

import * as service from './bot.service.js'
import { buildZip } from './bot.zip.js'

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

export async function getSessions(req, res) {
  try {
    const sessions = await service.listSessions(req.userId)
    res.status(200).json({ sessions })
  } catch (err) {
    sendError(res, err)
  }
}

export async function createSession(req, res) {
  try {
    const session = await service.createSession(req.userId)
    res.status(201).json(session)
  } catch (err) {
    sendError(res, err)
  }
}

export async function getSession(req, res) {
  try {
    const state = await service.getSessionState(req.params.sessionId, req.userId)
    res.status(200).json(state)
  } catch (err) {
    sendError(res, err)
  }
}

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

export async function deleteSession(req, res) {
  try {
    await service.deleteSession(req.params.sessionId, req.userId)
    res.status(204).end()
  } catch (err) {
    sendError(res, err)
  }
}

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

export async function getFilesList(req, res) {
  try {
    const files = await service.listFiles(req.params.sessionId, req.userId)
    res.status(200).json({ files })
  } catch (err) {
    sendError(res, err)
  }
}

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
