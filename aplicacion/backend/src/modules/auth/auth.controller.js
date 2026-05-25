/**
 * auth.controller.js
 *
 * Capa HTTP del módulo de autenticación. Cada función recibe la petición de
 * Express, valida que vengan los campos obligatorios, llama al service y
 * traduce el resultado (o el error) a un código de estado y un JSON.
 *
 * Responsabilidad: solo el "pegamento" entre HTTP y la lógica de negocio.
 * La lógica real (hash, tokens, reglas) está en auth.service.js.
 */

import * as service from './auth.service.js'

/**
 * POST /api/auth/register — registra un usuario nuevo.
 * Responde 201 con { user, token } o 400 si faltan datos / el email ya existe.
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
export async function register(req, res) {
  const { email, name, password } = req.body
  if (!email || !name || !password)
    return res.status(400).json({ error: 'email, name y password son obligatorios' })

  try {
    const result = await service.register({ email, name, password })
    res.status(201).json(result)
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
}

/**
 * POST /api/auth/login — inicia sesión.
 * Responde 200 con { user, token } o 401 si las credenciales no son válidas.
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
export async function login(req, res) {
  const { email, password } = req.body
  if (!email || !password)
    return res.status(400).json({ error: 'email y password son obligatorios' })

  try {
    const result = await service.login({ email, password })
    res.status(200).json(result)
  } catch (err) {
    res.status(401).json({ error: err.message })
  }
}

/**
 * GET /api/auth/me — devuelve los datos del usuario autenticado.
 * El userId lo inyecta el middleware requireAuth a partir del token.
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
export async function getMe(req, res) {
  try {
    const user = await service.getMe(req.userId)
    res.status(200).json(user)
  } catch (err) {
    res.status(404).json({ error: err.message })
  }
}

/**
 * PATCH /api/auth/me — actualiza el perfil (nombre y/o email) del usuario.
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
export async function updateMe(req, res) {
  try {
    const user = await service.updateUser(req.userId, req.body)
    res.status(200).json(user)
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
}

/**
 * PATCH /api/auth/me/password — cambia la contraseña del usuario.
 * Exige la contraseña actual y la nueva repetida dos veces.
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
export async function changePassword(req, res) {
  const { currentPassword, newPassword, confirmPassword } = req.body
  if (!currentPassword || !newPassword || !confirmPassword)
    return res.status(400).json({ error: 'currentPassword, newPassword y confirmPassword son obligatorios' })

  try {
    await service.changePassword(req.userId, { currentPassword, newPassword, confirmPassword })
    res.status(200).json({ message: 'Contraseña actualizada correctamente' })
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
}
