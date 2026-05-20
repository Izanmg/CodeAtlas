---
type: modules-index
backend:
  - id: auth-backend
    name: Autenticación
  - id: projects-backend
    name: Proyectos
  - id: diagrams-backend
    name: Diagramas
  - id: parser-backend
    name: Parser de documentación
  - id: settings-backend
    name: Ajustes de usuario
  - id: bot-backend
    name: Asistente IA
frontend:
  - id: auth-frontend
    name: Pantallas de autenticación
  - id: dashboard-frontend
    name: Dashboard
  - id: projects-frontend
    name: Proyectos
  - id: diagrams-frontend
    name: Diagramas
  - id: settings-frontend
    name: Ajustes
  - id: bot-frontend
    name: Asistente IA
file-types:
  backend:
    - controller
    - service
    - repository
    - middleware
    - router
    - helper
    - source
    - core
  frontend:
    - view
    - component
    - store
    - service
    - composable
    - helper
    - router
---

## Overview
CodeAtlas se organiza en módulos por responsabilidad funcional, siguiendo una arquitectura modular tanto en backend como en frontend. Cada módulo vive en su propia carpeta `src/modules/<nombre>/`.

El backend (Express + MySQL) expone una API REST bajo el prefijo `/api`. Cada módulo agrupa sus rutas, controlador, servicio y repositorio. La autenticación se aplica como middleware (`requireAuth`) sobre las rutas que lo necesitan.

El frontend (Vue 3 + Vite + Pinia) sigue el mismo patrón: cada módulo agrupa vistas, store y servicio HTTP. La comunicación con el backend pasa por un cliente HTTP centralizado en `src/lib/http.js` que inyecta el token JWT en cada petición.

El módulo `bot-backend` integra la API de Google Gemini para generar documentación estructurada en formato CodeAtlas a partir de descripciones en lenguaje natural. Cubre el requisito de integración de IA del ciclo y produce archivos listos para ser parseados por `parser-backend`.
