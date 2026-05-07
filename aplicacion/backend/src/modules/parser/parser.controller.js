/**
 * parser.controller.js
 *
 * HTTP layer of the parser module. Receives multipart uploads from multer,
 * forwards the file contents to the service, and returns the resulting
 * model — or a structured error.
 *
 * Error mapping:
 *   - validation errors (start with `[filename]`) → 400 Bad Request
 *   - everything else                             → 500 Internal Server Error
 */

import { parseDocumentation } from './parser.service.js'

/**
 * Endpoint POST /api/parser/doc
 * Parses .md documentation files into the unified JSON model.
 */
export async function parseDoc(req, res) {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ error: 'No files uploaded' })
  }

  // multer stores each upload as a Buffer. Convert to the shape the service expects.
  const files = req.files.map(file => ({
    filename: file.originalname,
    content: file.buffer.toString('utf-8')
  }))

  try {
    const model = await parseDocumentation(files)
    res.status(200).json(model)
  } catch (error) {
    // Validation errors come from validator.js and always start with `[`.
    // Anything else is an internal failure (regex, missing dep, etc).
    const isValidationError = error.message.startsWith('[')
    res.status(isValidationError ? 400 : 500).json({ error: error.message })
  }
}

/**
 * Endpoint POST /api/parser/code
 * Reserved for the next iteration of the project. Returns 501 for now.
 */
export async function parseCode(req, res) {
  res.status(501).json({ error: 'Code parser not implemented yet' })
}
