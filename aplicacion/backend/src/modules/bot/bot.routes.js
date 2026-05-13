/**
 * bot.routes.js
 *
 * Endpoints del módulo bot. Todas las rutas requieren autenticación.
 *
 *   GET    /api/bot/sessions                    — listar sesiones del usuario
 *   POST   /api/bot/sessions                    — crear sesión nueva
 *   GET    /api/bot/sessions/:sessionId         — estado completo (history + files)
 *   PATCH  /api/bot/sessions/:sessionId         — renombrar (body: { title })
 *   DELETE /api/bot/sessions/:sessionId         — borrar sesión + sus archivos
 *   POST   /api/bot/sessions/:sessionId/message — enviar mensaje al bot
 *   GET    /api/bot/sessions/:sessionId/files   — listar archivos generados
 *   DELETE /api/bot/sessions/:sessionId/files?path=... — borrar un archivo
 *   GET    /api/bot/sessions/:sessionId/zip     — descargar zip
 */

import { Router } from 'express'
import { requireAuth } from '../auth/auth.middleware.js'
import {
  getSessions,
  createSession,
  getSession,
  patchSession,
  deleteSession,
  postMessage,
  getFilesList,
  deleteOneFile,
  downloadZip,
} from './bot.controller.js'

const router = Router()

router.use(requireAuth)

router.get('/sessions',                       getSessions)
router.post('/sessions',                      createSession)
router.get('/sessions/:sessionId',            getSession)
router.patch('/sessions/:sessionId',          patchSession)
router.delete('/sessions/:sessionId',         deleteSession)
router.post('/sessions/:sessionId/message',   postMessage)
router.get('/sessions/:sessionId/files',      getFilesList)
router.delete('/sessions/:sessionId/files',   deleteOneFile)
router.get('/sessions/:sessionId/zip',        downloadZip)

export default router
