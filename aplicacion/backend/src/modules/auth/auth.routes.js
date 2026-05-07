import { Router } from 'express'
import { register, login, getMe, updateMe, changePassword } from './auth.controller.js'
import { requireAuth } from './auth.middleware.js'

const router = Router()

router.post('/register',          register)
router.post('/login',             login)
router.get('/me',                 requireAuth, getMe)
router.patch('/me',               requireAuth, updateMe)
router.patch('/me/password',      requireAuth, changePassword)

export default router
