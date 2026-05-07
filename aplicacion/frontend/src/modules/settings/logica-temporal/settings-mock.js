/**
 * settings-mock.js
 *
 * Lógica temporal del módulo settings. Por ahora delega en `auth-mock`
 * para actualizar el perfil del usuario; el cambio de contraseña no
 * verifica nada (es solo UI). Cuando exista el backend real, este
 * módulo expondrá `updateProfile`, `changePassword` y `deleteAccount`.
 */

import { updateUser } from '@/modules/auth/logica-temporal/auth-mock'

export async function updateProfile({ name, email }) {
  await fakeDelay(200)
  return updateUser({ name, email })
}

export async function changePassword(/* { current, next } */) {
  await fakeDelay(300)
  return true
}

function fakeDelay(ms) {
  return new Promise((r) => setTimeout(r, ms))
}
