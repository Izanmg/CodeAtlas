---
type: screen
id: settings
name: Settings
description: Pantalla de configuración personal — cambio de tema (claro/oscuro) y edición de datos de perfil del usuario
module: settings-frontend
requires-auth: true
---

## Description

Ruta `/settings`. Permite al usuario cambiar el tema visual de la aplicación y actualizar su nombre y email. Los cambios de tema se aplican inmediatamente al atributo `data-theme` del `<html>` y se persisten en localStorage.

## Elements

- selector de tema (claro / oscuro / sistema)
- formulario de perfil (nombre, email)
- botón Guardar cambios
- indicador de éxito al guardar

## Actions

- toggle-theme
- save-profile(patch)
