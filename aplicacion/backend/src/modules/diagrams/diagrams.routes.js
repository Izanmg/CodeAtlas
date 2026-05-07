import { Router } from 'express'
import multer from 'multer'
import { getRecent, getByProject, getById, generate, remove } from './diagrams.controller.js'
import { requireAuth } from '../auth/auth.middleware.js'

const upload = multer({ storage: multer.memoryStorage() })
const router = Router()

router.use(requireAuth)

// Diagramas de un proyecto
router.get('/projects/:projectId/diagrams',  getByProject)
router.post('/projects/:projectId/diagrams', upload.array('files'), generate)

// Diagramas recientes del usuario
router.get('/diagrams/recent', getRecent)

// Diagrama individual
router.get('/diagrams/:id',    getById)
router.delete('/diagrams/:id', remove)

export default router
