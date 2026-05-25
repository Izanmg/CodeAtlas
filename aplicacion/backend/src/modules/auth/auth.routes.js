/**
 * auth.routes.js
 *
 * Define los endpoints del módulo de autenticación y los conecta con sus
 * controllers. Las rutas /me van protegidas por requireAuth: solo se puede
 * acceder a ellas con un token válido.
 *
 * Este router se monta bajo /api/auth en app.js.
 */

import { Router } from 'express'
import { register, login, getMe, updateMe, changePassword } from './auth.controller.js'
import { requireAuth } from './auth.middleware.js'

const router = Router()

// Rutas públicas: no necesitan token.
router.post('/register',          register)
router.post('/login',             login)

// Rutas privadas: requireAuth valida el token y rellena req.userId antes
// de llegar al controller.
router.get('/me',                 requireAuth, getMe)
router.patch('/me',               requireAuth, updateMe)
router.patch('/me/password',      requireAuth, changePassword)

export default router
