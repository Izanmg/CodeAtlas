/**
 * bot.service.js
 *
 * Orquesta el flujo del bot. Cada conversación es una sesión independiente
 * identificada por `sessionId`. El usuario puede tener tantas sesiones como
 * quiera; el service nunca asume "la sesión del usuario", siempre recibe el
 * sessionId concreto sobre el que operar.
 *
 * Flujo de `processMessage`:
 *   1. Carga el estado de la sesión.
 *   2. Detecta qué formatos detallados conviene inyectar.
 *   3. Llama a Gemini con history + formatos.
 *   4. Valida los archivos. Reintenta una vez pidiendo corrección si fallan.
 *   5. Persiste el turno (mensaje usuario + respuesta bot) y los archivos.
 *   6. Si es el primer mensaje del usuario en esta sesión, renombra la
 *      sesión con un título derivado del mensaje.
 */

import { chat, DEFAULT_MODEL } from './bot.gemini.js'
import { validateFiles } from './bot.validator.js'
import * as repo from './bot.repository.js'

function detectFormats(userMessage, history) {
  const recentText = [userMessage, ...history.slice(-4).map(m => m.text)].join(' ').toLowerCase()
  const formats = []
  if (/m[oó]dulo|backend|frontend/.test(recentText)) formats.push('modulos')
  if (/pantalla|screen|vista|view/.test(recentText)) formats.push('pantallas')
  if (/flujo|flow|paso a paso/.test(recentText))     formats.push('flujos')
  if (/base de datos|entidad|tabla|database|db/.test(recentText)) formats.push('base-datos')
  if (/regla|convenci[oó]n|sistema/.test(recentText)) formats.push('reglas')
  return formats
}

function deriveTitle(message) {
  const trimmed = message.trim().replace(/\s+/g, ' ')
  if (trimmed.length <= 50) return trimmed
  return trimmed.slice(0, 47) + '...'
}

export async function listSessions(userId) {
  return repo.listSessions(userId)
}

export async function createSession(userId) {
  return repo.createSession(userId)
}

export async function getSessionState(sessionId, userId) {
  return repo.getSessionState(sessionId, userId)
}

export async function renameSession(sessionId, userId, title) {
  if (!title || typeof title !== 'string' || !title.trim()) {
    throw new Error('[bot] El título no puede estar vacío')
  }
  const ok = await repo.renameSession(sessionId, userId, title.trim().slice(0, 255))
  if (!ok) throw new Error('[bot] Sesión no encontrada')
}

export async function deleteSession(sessionId, userId) {
  const ok = await repo.deleteSession(sessionId, userId)
  if (!ok) throw new Error('[bot] Sesión no encontrada')
}

export async function listFiles(sessionId, userId) {
  return repo.getFiles(sessionId, userId)
}

export async function removeFile(sessionId, userId, filePath) {
  return repo.deleteFile(sessionId, userId, filePath)
}

export async function processMessage(sessionId, userId, userMessage, model = DEFAULT_MODEL) {
  if (!userMessage || typeof userMessage !== 'string' || !userMessage.trim()) {
    throw new Error('[bot] El mensaje no puede estar vacío')
  }

  const session = await repo.findSession(sessionId, userId)
  if (!session) throw new Error('[bot] Sesión no encontrada')

  const history = [...session.history, { role: 'user', text: userMessage }]
  const formats = detectFormats(userMessage, session.history)
  const existingFiles = await repo.getFiles(sessionId, userId)

  let response = await chat(history, formats, model, existingFiles)
  let validation = validateFiles(response.files || [])

  if (!validation.valid) {
    const correctionMessage = [
      'Los archivos que has generado tienen los siguientes problemas:',
      ...validation.errors.map(e => ` - ${e}`),
      '',
      'Devuélveme la respuesta corrigiendo solo esos problemas. Mantén el resto igual.'
    ].join('\n')

    const retryHistory = [
      ...history,
      { role: 'model', text: JSON.stringify(response) },
      { role: 'user', text: correctionMessage }
    ]

    response = await chat(retryHistory, formats, model, existingFiles)
    validation = validateFiles(response.files || [])
  }

  await repo.appendMessage(sessionId, userId, { role: 'user',  text: userMessage })
  await repo.appendMessage(sessionId, userId, { role: 'model', text: response.reply })

  if (validation.valid && response.files?.length) {
    await repo.upsertFiles(sessionId, response.files)
  }

  // Si la sesión todavía tiene el título por defecto y este es el primer
  // mensaje del usuario, renómbrala con un título derivado del mensaje.
  if (session.title === 'Nueva conversación' && session.history.length === 0) {
    await repo.renameSession(sessionId, userId, deriveTitle(userMessage))
  }

  const result = {
    reply: response.reply,
    files: response.files || []
  }
  if (!validation.valid) {
    result.errors = validation.errors
  }
  return result
}
