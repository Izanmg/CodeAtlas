---
type: flow
id: update-profile
name: Actualizar perfil
description: Cambiar el nombre o el email del usuario autenticado
trigger: el usuario edita los campos del bloque "Perfil" en ajustes y pulsa Guardar cambios
screens: [settings]
modules: [settings-frontend, auth-frontend, auth-backend]
database: [users]
---

## Steps
- [screen:settings] El usuario edita nombre y/o email en el bloque Perfil y pulsa Guardar cambios
- [frontend:settings-frontend/SettingsView.vue/handleUpdateProfile] Se valida que al menos uno de los campos haya cambiado
- [frontend:auth-frontend/auth.store.js/updateUser] El store delega en authService.updateUser
- [frontend:auth-frontend/auth.service.js/updateUser] Se hace PATCH /api/auth/me con { name, email }
- [backend:auth-backend/auth.controller.js/updateMe] Llega la petición al controller (con requireAuth, req.userId disponible)
- [backend:auth-backend/auth.service.js/updateUser] Se validan los campos: nombre no vacío y email con formato válido
- [backend:auth-backend/auth.repository.js/updateUser] UPDATE name, email WHERE id = ?
- [database:users] UPDATE de name y/o email (solo los campos enviados)
- [backend:auth-backend/auth.service.js/updateUser] Devuelve el usuario actualizado (sin password_hash)
- [frontend:auth-frontend/auth.store.js/updateUser] El store recibe el user actualizado y lo guarda en el ref reactivo
- [frontend:auth-frontend/auth.store.js/updateUser] Si cambió el email, también actualiza la entrada `codeatlas:auth` en localStorage para que el cliente HTTP siga enviando el token correcto en futuras peticiones
- [screen:settings] El bloque muestra mensaje de éxito y los nuevos valores quedan reflejados en el header del AppShell (iniciales y email)

## Error Cases
- Nombre vacío: el frontend bloquea el envío; si llega al backend devuelve 400 con "El nombre es obligatorio"
- Email con formato inválido: el backend devuelve 400 con "Email inválido"
- Email ya registrado por otro usuario: la constraint UNIQUE de la tabla users hace fallar el UPDATE; el repositorio captura `ER_DUP_ENTRY` y el service lo traduce a 400 con "Email ya registrado"
- Sin sesión activa: requireAuth devuelve 401

## Notes
El backend nunca devuelve el campo `password_hash` en la respuesta — el repositorio lo excluye del SELECT y el service no lo añade.
Si el usuario cambia el email, **el JWT sigue siendo válido** porque la firma se hace contra el `userId` (no contra el email). El cliente HTTP lo sigue enviando sin cambios. Solo hay que actualizar el localStorage para que la próxima carga inicial muestre el email correcto en el AppShell.
La actualización es parcial: si el usuario solo modifica el nombre, el email se omite del PATCH y el repositorio mantiene el valor anterior gracias a COALESCE en el SQL.
