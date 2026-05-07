import { Router } from 'express'
import { getAll, getById, create, update, remove } from './projects.controller.js'
import { requireAuth } from '../auth/auth.middleware.js'

const router = Router()

router.use(requireAuth)

router.get('/',     getAll)
router.post('/',    create)
router.get('/:id',  getById)
router.patch('/:id', update)
router.delete('/:id', remove)

export default router
