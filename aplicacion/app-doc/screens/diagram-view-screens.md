---
type: screen
id: diagram-view
name: Diagram View
description: Canvas interactivo a pantalla completa que visualiza la arquitectura de una aplicación como un diagrama de nodos y conexiones
module: diagrams-frontend
requires-auth: true
---

## Description

Ruta `/diagrams/:id`. Ocupa toda la pantalla. Renderiza el diagrama con Vue Flow usando seis tipos de nodo personalizados. Tiene una barra superior con el nombre del proyecto y del diagrama, y un contador de bloques y conexiones.

El usuario puede:
- Hacer clic en un nodo para activar el **modo foco** (los nodos no relacionados se atenúan) y abrir el **side panel**
- Hacer clic en el lienzo o pulsar Esc para limpiar el foco y cerrar el panel
- Usar el **toolbar de filtros** para activar/desactivar tipos de nodo
- Hacer **fit view**, activar/desactivar el minimap y limpiar el foco desde el toolbar
- Navegar por el canvas (pan, zoom) con el ratón o trackpad
- Expandir la **leyenda** flotante con los tipos de bloque y estilos de conexión
- Explorar el nodo seleccionado en el **side panel** con tres pestañas: Resumen, Conexiones y Detalle

## Elements

- barra superior (proyecto / nombre del diagrama / contadores)
- botón Volver (navega al proyecto)
- canvas Vue Flow (pantalla completa menos la barra)
- toolbar de filtros por tipo de nodo (CanvasToolbar)
- leyenda flotante inferior izquierda (CanvasLegend)
- minimap superior derecho (MiniMap)
- controles de zoom inferior derecho (Controls)
- side panel derecho (SidePanel, 380px)
- seis nodos personalizados: BackendNode, FrontendNode, ScreenNode, DatabaseNode, FlowNode, RulesNode

## Actions

- click-node (activa modo foco y abre side panel)
- click-pane (limpia foco y cierra panel)
- press-escape (cierra panel)
- toggle-filter(kind)
- fit-view
- toggle-minimap
- clear-focus
- go-back
- select-connected-node(id) (desde el side panel)

## States

- loading (antes de que el diagrama se cargue)
- focus-active (un nodo está seleccionado — lienzo con clase rf-dim)
- panel-open (nodo seleccionado — side panel visible)
- not-found (diagrama no existe — redirige al dashboard)
