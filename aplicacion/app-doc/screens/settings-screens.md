---
type: screen
id: settings
name: Ajustes
description: Pantalla de preferencias del usuario y datos de cuenta
module: settings-frontend
folder: views
file: settings-view
requires-auth: true
routes:
  - /settings
navigates-to: [dashboard, login]
components:
  - AppShell
  - PageHeader
  - Card
  - Field
  - Input
  - Button
  - Segmented
---

## Description
Centraliza las preferencias del usuario (tema visual: claro/oscuro) y la edición de los datos de cuenta (nombre, email, cambio de contraseña). El cierre de sesión también vive aquí: al cerrar sesión se limpian los stores de auth y settings y se redirige a `/login`.

## Elements
- bloque "Apariencia" con selector de tema light/dark
- bloque "Perfil" con inputs de nombre y email + botón Guardar cambios
- bloque "Contraseña" con tres inputs (actual, nueva, confirmación) + botón Cambiar
- botón "Cerrar sesión"
- mensajes de éxito o error por bloque tras cada acción

## Actions
- change-theme
- update-profile
- change-password
- logout

## States
- default
- saving
- success
- error
