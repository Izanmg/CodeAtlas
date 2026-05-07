---
type: screen
id: project-detail
name: Project Detail
description: Vista de detalle de un proyecto — muestra su información y la lista de diagramas que contiene con acceso a cada canvas
module: projects-frontend
requires-auth: true
---

## Description

Ruta `/projects/:id`. Carga el proyecto por el ID de la URL y lista sus diagramas. Desde aquí el usuario puede abrir cualquier diagrama existente o iniciar la creación de uno nuevo navegando a la vista de generación.

## Elements

- cabecera con nombre y descripción del proyecto
- cuadrícula de tarjetas de diagrama (nombre, fecha)
- botón Nuevo diagrama
- botón Volver al dashboard

## Actions

- go-to-diagram(id)
- go-to-new-diagram
- go-back

## States

- loading (mientras se carga el proyecto y sus diagramas)
- empty (cuando el proyecto no tiene diagramas)
- not-found (si el ID de la URL no existe — redirige al dashboard)
