import { Router } from 'express'
import { getSettings, updateSettings } from './settings.controller.js'
import { requireAuth } from '../auth/auth.middleware.js'

const router = Router()

router.use(requireAuth)
router.get('/', getSettings)
router.patch('/', updateSettings)

export default router
