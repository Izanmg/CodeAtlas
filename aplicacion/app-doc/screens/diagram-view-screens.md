---
type: screen
id: diagram-view
name: Canvas del diagrama
description: Vista interactiva del diagrama con Vue Flow, modo Relaciones y modo Flujos
module: diagrams-frontend
folder: views
file: diagram-view
requires-auth: true
routes:
  - /diagrams/:id
navigates-to: [project-detail, dashboard]
components:
  - VueFlow
  - CanvasToolbar
  - CanvasLegend
  - CanvasRules
  - CanvasFlowSelector
  - CanvasFlowPanel
  - SidePanel
---

## Description
Vista a pantalla completa del canvas. Renderiza los nodos del modelo con Vue Flow, soporta drag & drop con historial undo/redo, guardado del layout en el backend y dos modos de visualización: Relaciones (edges coloreados por tipo, filtros por capa, panel de reglas a la izquierda) y Flujos (selector de flujo a la derecha, pasos secuenciales a la izquierda, edges amarillos dirigidos entre nodos del flujo activo).

## Elements
- topbar con nombre del diagrama, breadcrumb, undo/redo, botón Guardar
- toolbar central con toggle Relaciones/Flujos, filtros por tipo de nodo, botón ajustar vista
- panel flotante izquierdo (CanvasRules en modo Relaciones, CanvasFlowPanel en modo Flujos)
- panel flotante derecho (solo en modo Flujos: CanvasFlowSelector)
- nodos del canvas con sus chips de flujos al pie
- side panel derecho que se abre al seleccionar un nodo (Resumen / Conexiones / Detalle)
- modal "salir sin guardar" si hay cambios pendientes al navegar

## Actions
- select-node
- drag-node
- save-layout
- undo / redo
- toggle-mode
- pick-flow
- toggle-filter
- fit-view
- clear-focus
- back-to-project

## States
- default
- focus
- editing
- saving
- saved
