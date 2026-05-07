/**
 * parser.controller.js
 *
 * Capa HTTP del módulo parser. Recibe las subidas multipart de multer,
 * pasa el contenido de los archivos al service y devuelve el modelo
 * resultante — o un error estructurado.
 *
 * Mapeo de errores:
 *   - errores de validación (empiezan por `[nombre-archivo]`) → 400 Bad Request
 *   - el resto                                               → 500 Internal Server Error
 */

import { parseDocumentation } from './parser.service.js'

/**
 * Endpoint POST /api/parser/doc
 * Parsea archivos .md de documentación y devuelve el modelo JSON unificado.
 */
export async function parseDoc(req, res) {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ error: 'No se han subido archivos' })
  }

  // multer guarda cada subida como Buffer. Lo convertimos al formato que espera el service.
  const files = req.files.map(file => ({
    filename: file.originalname,
    content: file.buffer.toString('utf-8')
  }))

  try {
    const model = await parseDocumentation(files)
    res.status(200).json(model)
  } catch (error) {
    // Los errores de validación vienen de validator.js y siempre empiezan por `[`.
    // Cualquier otro error es un fallo interno (regex, dependencia, etc.).
    const isValidationError = error.message.startsWith('[')
    res.status(isValidationError ? 400 : 500).json({ error: error.message })
  }
}

/**
 * Endpoint POST /api/parser/code
 * Reservado para la siguiente iteración del proyecto. Devuelve 501 por ahora.
 */
export async function parseCode(req, res) {
  res.status(501).json({ error: 'El parser de código todavía no está implementado' })
}
