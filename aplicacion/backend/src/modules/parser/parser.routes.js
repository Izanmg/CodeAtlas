/**
 * parser.routes.js
 *
 * Defines the HTTP endpoints of the parser module and wires multer in
 * for the file upload middleware.
 *
 * memoryStorage is used on purpose: the parser only needs the file
 * contents in-memory for the duration of the request. Writing them to
 * disk would add I/O overhead and require cleanup logic.
 */

import { Router } from 'express'
import multer from 'multer'
import { parseDoc, parseCode } from './parser.controller.js'

const upload = multer({ storage: multer.memoryStorage() })

const router = Router()

// The form field MUST be named "files" — the frontend will use this name.
router.post('/doc',  upload.array('files'), parseDoc)
router.post('/code', upload.array('files'), parseCode)

export default router
