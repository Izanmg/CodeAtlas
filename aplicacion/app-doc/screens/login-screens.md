---
type: screen
id: login
name: Login
description: Pantalla de entrada para usuarios no autenticados
module: auth-frontend
folder: views
file: login-view
requires-auth: false
routes:
  - /login
navigates-to: [dashboard, register]
components:
  - AuthShell
  - AuthVisualSide
---

## Description
Pantalla pública por la que entran los usuarios no autenticados. Si llega un usuario con sesión activa, el guard de Vue Router lo redirige a `/`. Tras un login correcto, se almacenan usuario + token en localStorage y se navega al dashboard.

## Elements
- input email
- input contraseña
- botón Iniciar sesión
- enlace "¿No tienes cuenta? Regístrate"
- mensaje de error en línea cuando las credenciales son inválidas

## Actions
- submit-login
- go-to-register

## States
- default
- loading
- error
