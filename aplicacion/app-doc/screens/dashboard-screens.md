---
type: screen
id: dashboard
name: Dashboard
description: Vista de inicio del usuario autenticado — resumen de proyectos recientes y diagramas recientes con accesos directos
module: dashboard-frontend
requires-auth: true
---

## Description

Ruta raíz `/`. Muestra dos secciones: proyectos recientes (cuadrícula de tarjetas con nombre, descripción y contador de diagramas) y diagramas recientes (tarjetas con nombre y proyecto al que pertenecen). Incluye acceso rápido para crear un nuevo proyecto.

## Elements

- cuadrícula de proyectos recientes
- cuadrícula de diagramas recientes
- botón Nuevo proyecto
- barra lateral de navegación

## Actions

- go-to-project(id)
- go-to-diagram(id)
- open-new-project-modal

## States

- loading (mientras se cargan proyectos y diagramas)
- empty (cuando no hay proyectos todavía)
