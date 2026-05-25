/**
 * settings.routes.js
 *
 * Endpoints de las preferencias del usuario. Todo el módulo va protegido por
 * requireAuth. Se monta bajo /api/settings en app.js.
 */

import { Router } from 'express'
import { getSettings, updateSettings } from './settings.controller.js'
import { requireAuth } from '../auth/auth.middleware.js'

const router = Router()

// Exige token válido para leer o cambiar preferencias.
router.use(requireAuth)
router.get('/', getSettings)
router.patch('/', updateSettings)

export default router
