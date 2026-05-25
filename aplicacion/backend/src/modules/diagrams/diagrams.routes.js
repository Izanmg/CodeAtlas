/**
 * diagrams.routes.js
 *
 * Define los endpoints del módulo de diagramas. Todas las rutas son privadas
 * (requireAuth). Las que reciben archivos .md usan multer con almacenamiento en
 * memoria: los .md no se guardan en disco, se leen del buffer y se parsean al
 * vuelo.
 *
 * Este router se monta bajo /api en app.js, por eso las rutas incluyen el
 * prefijo completo (/projects/... y /diagrams/...).
 */

import { Router } from 'express'
import multer from 'multer'
import { getRecent, getByProject, getById, generate, update, saveLayout, saveModuleLayout, remove } from './diagrams.controller.js'
import { requireAuth } from '../auth/auth.middleware.js'

// memoryStorage: los archivos subidos quedan en req.files[].buffer, nunca en disco.
const upload = multer({ storage: multer.memoryStorage() })
const router = Router()

// Exige token válido para cualquier ruta de diagramas.
router.use(requireAuth)

// Diagramas de un proyecto
router.get('/projects/:projectId/diagrams',  getByProject)
router.post('/projects/:projectId/diagrams', upload.array('files'), generate)

// Diagramas recientes del usuario
router.get('/diagrams/recent', getRecent)

// Diagrama individual
router.get('/diagrams/:id',           getById)
router.patch('/diagrams/:id',         upload.array('files'), update)
router.patch('/diagrams/:id/layout',  saveLayout)
router.patch('/diagrams/:id/modules/:moduleId/layout', saveModuleLayout)
router.delete('/diagrams/:id',        remove)

export default router
