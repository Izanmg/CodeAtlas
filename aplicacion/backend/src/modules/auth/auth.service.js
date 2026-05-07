import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import * as repo from './auth.repository.js'

const JWT_SECRET = process.env.JWT_SECRET || 'codeatlas_dev_secret'
const JWT_EXPIRES = '7d'
const SALT_ROUNDS = 10

export async function register({ email, name, password }) {
  const existing = await repo.findByEmail(email)
  if (existing) throw new Error('El email ya está registrado')

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS)
  const user = await repo.createUser({ email, name, passwordHash })
  const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: JWT_EXPIRES })
  return { user, token }
}

export async function login({ email, password }) {
  const row = await repo.findByEmail(email)
  if (!row) throw new Error('Credenciales incorrectas')

  const valid = await bcrypt.compare(password, row.password_hash)
  if (!valid) throw new Error('Credenciales incorrectas')

  const user = { id: row.id, email: row.email, name: row.name, createdAt: row.created_at }
  const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: JWT_EXPIRES })
  return { user, token }
}

export async function getMe(userId) {
  const user = await repo.findById(userId)
  if (!user) throw new Error('Usuario no encontrado')
  return user
}

export async function updateUser(userId, patch) {
  return repo.updateUser(userId, patch)
}

export async function changePassword(userId, { currentPassword, newPassword, confirmPassword }) {
  if (newPassword !== confirmPassword)
    throw new Error('Las contraseñas nuevas no coinciden')

  if (newPassword.length < 8)
    throw new Error('La nueva contraseña debe tener al menos 8 caracteres')

  const row = await repo.findByEmail(
    (await repo.findById(userId)).email
  )
  const valid = await bcrypt.compare(currentPassword, row.password_hash)
  if (!valid) throw new Error('La contraseña actual es incorrecta')

  const passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS)
  await repo.updatePassword(userId, passwordHash)
}

export function verifyToken(token) {
  return jwt.verify(token, JWT_SECRET)
}
