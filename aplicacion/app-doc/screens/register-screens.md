---
type: screen
id: register
name: Registro
description: Pantalla pública para crear una cuenta nueva
module: auth-frontend
folder: views
file: register-view
requires-auth: false
routes:
  - /register
navigates-to: [dashboard, login]
components:
  - AuthShell
  - AuthVisualSide
---

## Description
Permite crear una cuenta nueva con nombre, email y contraseña. Tras un registro exitoso el backend devuelve usuario + token y el cliente queda autenticado automáticamente, redirigiendo al dashboard sin pasar por login.

## Elements
- input nombre
- input email
- input contraseña
- botón Crear cuenta
- enlace "¿Ya tienes cuenta? Inicia sesión"
- mensaje de error si el email ya está registrado o la contraseña no cumple los requisitos

## Actions
- submit-register
- go-to-login

## States
- default
- loading
- error
