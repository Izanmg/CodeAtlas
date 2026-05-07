import { verifyToken } from './auth.service.js'

export function requireAuth(req, res, next) {
  const header = req.headers.authorization
  if (!header?.startsWith('Bearer '))
    return res.status(401).json({ error: 'Token requerido' })

  try {
    const { userId } = verifyToken(header.slice(7))
    req.userId = userId
    next()
  } catch {
    res.status(401).json({ error: 'Token inválido o expirado' })
  }
}
