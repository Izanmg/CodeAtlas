---
type: flow
id: change-password
name: Cambiar contraseña
description: Cambio de contraseña verificando la actual antes de hashear y guardar la nueva
trigger: el usuario rellena el bloque "Contraseña" en ajustes y pulsa Cambiar
screens: [settings]
modules: [settings-frontend, auth-frontend, auth-backend]
database: [users]
---

## Steps
- [screen:settings] El usuario rellena los tres campos: contraseña actual, contraseña nueva, confirmación de la nueva
- [frontend:settings-frontend/SettingsView.vue/handleChangePassword] Se valida que los tres campos estén presentes y que nueva === confirmación
- [frontend:auth-frontend/auth.store.js/changePassword] El store delega en authService.changePassword
- [frontend:auth-frontend/auth.service.js/changePassword] Se hace PATCH /api/auth/me/password con { currentPassword, newPassword, confirmPassword }
- [backend:auth-backend/auth.controller.js/changePassword] Llega la petición al controller (con requireAuth, req.userId disponible)
- [backend:auth-backend/auth.service.js/changePassword] Se valida que `newPassword === confirmPassword` y que la nueva tiene al menos 8 caracteres
- [backend:auth-backend/auth.repository.js/findById] Se obtiene el usuario por id para acceder al `password_hash` actual
- [database:users] SELECT password_hash WHERE id = ?
- [backend:auth-backend/auth.service.js/changePassword] Se compara `currentPassword` con el hash usando `bcrypt.compare`. Si no coincide, lanza error 401
- [backend:auth-backend/auth.service.js/changePassword] Se hashea `newPassword` con bcrypt (saltRounds: 10)
- [backend:auth-backend/auth.repository.js/updatePassword] UPDATE password_hash WHERE id = ?
- [database:users] UPDATE de password_hash
- [screen:settings] El bloque muestra mensaje de éxito durante 2 segundos y limpia los tres campos

## Error Cases
- Cualquier campo vacío: el frontend bloquea el envío y muestra error en línea
- Nueva contraseña distinta a la confirmación: el frontend bloquea antes de enviar; el backend también valida (defensa en profundidad)
- Nueva contraseña con menos de 8 caracteres: el backend devuelve 400 con "La contraseña debe tener al menos 8 caracteres"
- Contraseña actual incorrecta: bcrypt.compare devuelve false, el service lanza error con mensaje "Contraseña actual incorrecta", el cliente lo muestra como 401
- Sin sesión activa: requireAuth devuelve 401 antes de llegar al handler

## Notes
La verificación de la contraseña actual es **obligatoria** y se hace en el backend con bcrypt.compare contra el hash almacenado. El frontend no tiene forma de saltarse este paso: aunque conozca el `currentPassword`, debe enviárselo al backend para que lo valide.
La nueva contraseña no se envía nunca en texto plano fuera de la petición HTTPS — se hashea inmediatamente al llegar al service y solo el hash llega a la BD.
El JWT del usuario sigue siendo válido tras el cambio (la firma no incluye el password_hash). Para invalidar sesiones existentes haría falta un mecanismo extra (token revocation list) que hoy no existe.
