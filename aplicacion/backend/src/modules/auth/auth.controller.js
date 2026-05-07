import * as service from './auth.service.js'

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

export async function getMe(req, res) {
  try {
    const user = await service.getMe(req.userId)
    res.status(200).json(user)
  } catch (err) {
    res.status(404).json({ error: err.message })
  }
}

export async function updateMe(req, res) {
  try {
    const user = await service.updateUser(req.userId, req.body)
    res.status(200).json(user)
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
}

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
