---
type: modules-index
backend:
  - id: parser-backend
    name: Parser
frontend:
  - id: auth-frontend
    name: Auth
  - id: dashboard-frontend
    name: Dashboard
  - id: projects-frontend
    name: Projects
  - id: diagrams-frontend
    name: Diagrams
  - id: settings-frontend
    name: Settings
file-types:
  backend:
    - controller
    - service
    - repository
    - router
    - helper
    - config
    - source
  frontend:
    - view
    - component
    - store
    - composable
    - helper
    - router
---

## Overview

CodeAtlas es una herramienta que lee archivos `.md` de documentación de una app y genera diagramas visuales interactivos de su arquitectura. La aplicación está dividida en backend (Node.js + Express) y frontend (Vue 3 + Vite + Pinia).

El backend actualmente tiene un único módulo implementado: el **parser**, que recibe archivos `.md` por HTTP multipart, los procesa a través de un pipeline secuencial (extracción → validación → modelo → layout) y devuelve un modelo JSON con las coordenadas de cada nodo.

El frontend tiene cinco módulos: **auth** (sesión), **dashboard** (vista de inicio), **projects** (gestión de proyectos), **diagrams** (canvas de visualización con Vue Flow) y **settings** (preferencias del usuario). Todos los módulos usan stores de Pinia que delegan a `logica-temporal/` — capas mock que serán sustituidas cuando se conecte el backend.
