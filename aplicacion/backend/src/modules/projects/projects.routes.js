/**
 * projects.routes.js
 *
 * Define los endpoints del módulo de proyectos. Todas las rutas son privadas:
 * el router.use(requireAuth) de arriba protege todo el módulo de una sola vez,
 * así que no hace falta repetir el middleware en cada ruta.
 *
 * Este router se monta bajo /api/projects en app.js.
 */

import { Router } from 'express'
import { getAll, getById, create, update, remove } from './projects.controller.js'
import { requireAuth } from '../auth/auth.middleware.js'

const router = Router()

// Exige token válido para cualquier ruta de proyectos.
router.use(requireAuth)

router.get('/',     getAll)
router.post('/',    create)
router.get('/:id',  getById)
router.patch('/:id', update)
router.delete('/:id', remove)

export default router
