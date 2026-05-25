/**
 * auth.middleware.js
 *
 * Middleware de Express que protege las rutas que requieren estar autenticado.
 * Lee el token "Bearer" de la cabecera Authorization, lo verifica y, si es
 * válido, deja el id del usuario disponible en req.userId para el resto de la
 * cadena (controllers, etc.).
 *
 * Responsabilidad: solo el control de acceso por token. No consulta BD.
 */

import { verifyToken } from './auth.service.js'

/**
 * Comprueba que la petición lleve un token válido. Si lo lleva, añade
 * req.userId y continúa; si no, corta con un 401.
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 * @returns {void}
 */
export function requireAuth(req, res, next) {
  const header = req.headers.authorization
  // El token tiene que venir como "Bearer <token>"; si no, ni lo intentamos.
  if (!header?.startsWith('Bearer '))
    return res.status(401).json({ error: 'Token requerido' })

  try {
    // header.slice(7) quita el prefijo "Bearer " y deja solo el token.
    const { userId } = verifyToken(header.slice(7))
    req.userId = userId
    next()
  } catch {
    // verifyToken lanza si el token está manipulado o ha caducado.
    res.status(401).json({ error: 'Token inválido o expirado' })
  }
}
