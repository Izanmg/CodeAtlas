---
type: screen
id: register
name: Register
description: Formulario de creación de cuenta nueva — nombre, email y contraseña — con redirección al dashboard tras registrarse
module: auth-frontend
requires-auth: false
---

## Description

Pantalla accesible solo para usuarios sin sesión (guestOnly). Recoge los datos mínimos para crear una cuenta. Al enviar, llama al store de auth con el payload; si tiene éxito inicia sesión directamente y redirige a `/`.

## Elements

- campo nombre
- campo email
- campo contraseña
- botón Crear cuenta
- enlace de vuelta al login
- mensaje de error (condicional)

## Actions

- submit-register
- go-to-login
