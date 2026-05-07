/**
 * parser.routes.js
 *
 * Define los endpoints HTTP del módulo parser y conecta multer como
 * middleware para la subida de archivos.
 *
 * Se usa memoryStorage a propósito: el parser solo necesita el contenido
 * de los archivos en memoria durante la petición. Escribirlos a disco
 * añadiría I/O innecesario y obligaría a una lógica de limpieza posterior.
 */

import { Router } from 'express'
import multer from 'multer'
import { parseDoc, parseCode } from './parser.controller.js'

const upload = multer({ storage: multer.memoryStorage() })

const router = Router()

// El campo del formulario DEBE llamarse "files" — el frontend usará este nombre.
router.post('/doc',  upload.array('files'), parseDoc)
router.post('/code', upload.array('files'), parseCode)

export default router
