---
type: screen
id: login
name: Login
description: Punto de entrada para usuarios no autenticados — formulario de email y contraseña con redirección al dashboard tras iniciar sesión
module: auth-frontend
requires-auth: false
---

## Description

Pantalla accesible solo para usuarios sin sesión (guestOnly). Si el usuario ya está autenticado, el router redirige automáticamente al dashboard. Al enviar el formulario, llama al store de auth; si hay error muestra el mensaje en pantalla; si tiene éxito redirige a `/`.

## Elements

- campo email
- campo contraseña (tipo password)
- botón Iniciar sesión
- enlace a la pantalla de registro
- mensaje de error (condicional)

## Actions

- submit-login
- go-to-register
