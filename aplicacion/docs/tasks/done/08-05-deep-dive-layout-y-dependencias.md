# Layout persistente del deep-dive + panel de dependencias

Dos cambios sobre la vista `/diagrams/:id/modules/:moduleId` (el deep-dive de un módulo).

## 1. Las posiciones del deep-dive ahora se guardan

Antes: cada vez que entrabas al deep-dive, el layout se calculaba desde cero (columnas por carpeta). Si arrastrabas un nodo, la posición se perdía al cambiar de pantalla.

Ahora: el deep-dive tiene los mismos controles que el canvas conceptual (drag → snapshot → undo/redo → botón Guardar) y las posiciones se persisten por módulo.

### Forma del JSON

`diagrams.layout_json` pasa de un objeto plano a la forma:

```json
{
  "main": {
    "mod-auth-backend": { "x": 520, "y": 80 },
    "scr-login":        { "x": 1440, "y": 80 }
  },
  "modules": {
    "auth-backend": {
      "file-auth-controller": { "x": 0,   "y": 80 },
      "file-auth-service":    { "x": 340, "y": 80 }
    }
  }
}
```

- `main` = posiciones del canvas conceptual (lo que antes era el objeto raíz).
- `modules[moduleId]` = posiciones del deep-dive de ese módulo.

### Compatibilidad sin migración SQL

`aplicacion/backend/src/modules/diagrams/diagrams.repository.js` tiene un helper `normalizeLayout(raw)` que detecta si el JSON guardado tiene la forma vieja (sin clave `main`) y lo envuelve al vuelo como `{ main: raw, modules: {} }`. Los diagramas existentes abren sin tocar BD; al primer save quedan persistidos en la forma nueva.

### Parser asigna posiciones default

`aplicacion/backend/src/modules/parser/core/layout-calculator.js` ahora devuelve `{ main, modules }`. Para cada módulo backend/frontend con `files` declarados, calcula el layout por columnas-carpeta (mismo algoritmo que `buildDeepDive` del frontend, duplicado). Resultado: los diagramas recién generados o regenerados ya traen el deep-dive con posiciones razonables.

### Endpoint nuevo

`PATCH /api/diagrams/:id/modules/:moduleId/layout` — body `{ layout: { [fileNodeId]: { x, y } } }`. El repository hace merge en `layout.modules[moduleId]` preservando el resto del JSON. El endpoint anterior `PATCH /diagrams/:id/layout` sigue funcionando para el canvas conceptual; ahora también hace merge en lugar de sobrescribir todo.

### Frontend

`aplicacion/frontend/src/modules/diagrams/core/auto-layout-deep.js` — `buildDeepDive(module, model, savedLayout)` acepta un layout guardado y lo aplica sobre las posiciones default.

`aplicacion/frontend/src/modules/diagrams/views/ModuleDeepDiveView.vue` — mismo patrón completo que `DiagramView`:
- `captureSnapshot` / `pushSnapshot` / `applySnapshot` con historial.
- `handleNodesChange` acumula posiciones durante el drag y commitea al `dragging:false`.
- `saveLayout` llama a `diagramsStore.saveModuleLayout` y resetea el historial.
- Topbar con botones **Undo / Redo / Guardar** + estado visual ("Guardando…" / "Guardado" / "Guardar").
- Atajos `Ctrl+Z` / `Ctrl+Y`.
- Filtro `n.id.startsWith('file-')` para que el snapshot solo capture FileNodes (no las pantallas frontier, que tienen su propia posición calculada).

`aplicacion/frontend/src/modules/diagrams/stores/diagrams.store.js` — `saveModuleLayout` también actualiza `current.data.layout.modules[moduleId]` para que la siguiente vez que entres al deep-dive sin recargar veas las posiciones nuevas.

## 2. Panel de "Módulos dependidos" arriba a la derecha

Antes: cada módulo en `depends-on` o `consumes-api` aparecía como un **nodo frontier** flotando a la derecha del canvas del deep-dive, sin edges (no sabemos qué archivo concreto importa qué del otro módulo). Eran cajas sin conectar — puro ruido visual.

Ahora: esos frontier nodes desaparecen del canvas y se trasladan a un panel flotante arriba a la derecha, siguiendo el mismo patrón pill/panel que `CanvasFolders` y `CanvasRules`.

### Comportamiento

- Si el módulo no tiene dependencias, el panel **no se renderiza** (no contamina el canvas para módulos hoja).
- Pill colapsada: `N dependencias` con icono `Network`.
- Panel expandido: lista con cada módulo dependido — icono según capa (`Server` / `LayoutPanelTop`), nombre, id mono y la vía (`depends-on` o `consumes-api`).
- Click en una fila → navega al deep-dive de ese módulo (`router.push(/diagrams/:id/modules/:moduleId)`).

### Fix: navegación entre módulos

Cuando el usuario cambia de un módulo a otro sin salir de la vista, Vue Router reusa el componente y `onMounted` NO se vuelve a disparar — solo cambia el path. Para arreglarlo se extrajo la lógica de carga a `loadModule(id, mid)` y se añadió un `watch` sobre los params de la ruta que llama a `loadModule` cuando cambian. Al saltar de módulo se resetea `selectedId`, `activeFlowId` y `mode` para empezar limpio.

### Implementación

`aplicacion/frontend/src/modules/diagrams/core/auto-layout-deep.js`:
- Eliminada la creación de nodos `frontier-module-*` en el canvas.
- `buildDeepDive` devuelve ahora también `moduleDeps: [{ id, name, layer, via }]` con cada módulo dependido. `via` indica si entra por `consumes-api` (solo frontends) o `depends-on`.

`aplicacion/frontend/src/modules/diagrams/components/CanvasModuleDeps.vue` (nuevo) — el panel completo.

`aplicacion/frontend/src/modules/diagrams/views/ModuleDeepDiveView.vue`:
- Nuevo ref `moduleDeps` poblado desde `buildDeepDive`.
- Monta `<CanvasModuleDeps :modules="moduleDeps" />` en la esquina superior derecha en modo Relaciones (en modo Flujos esa esquina sigue siendo del `CanvasFlowSelector`).

Las pantallas frontier (lado izquierdo) siguen como están — esas sí tienen un edge real al archivo vía `screen.file`.

## Cómo se prueba

1. Abre un diagrama existente (los que tienen `layout_json` en forma plana siguen funcionando — se autoenvuelven al leer).
2. Doble-click sobre un módulo con varias dependencias → entras al deep-dive.
3. Arriba a la derecha verás la pastilla `N dependencias`. Click → lista con todos los módulos dependidos.
4. Click en uno de la lista → te lleva al deep-dive de ese módulo sin recargar la página.
5. Arrastra cualquier FileNode → habilita Undo y el botón Guardar.
6. Pulsa Guardar → se persiste el layout para ese módulo. Sal y vuelve a entrar: las posiciones se mantienen.

## Compatibilidad

- Diagramas viejos: abren sin migración (forma plana se autoenvuelve al leer).
- Diagramas recientes: el parser ya pre-calcula `layout.modules[*]` con posiciones razonables.
- Si el usuario nunca guarda manualmente, sigue viendo el default por columnas que calcula el frontend.

## Archivos tocados

**Nuevos:**
- `aplicacion/frontend/src/modules/diagrams/components/CanvasModuleDeps.vue`

**Modificados — backend:**
- `aplicacion/backend/src/modules/parser/core/layout-calculator.js` (returns `{ main, modules }`)
- `aplicacion/backend/src/modules/diagrams/diagrams.repository.js` (`normalizeLayout`, `updateModuleLayout`, `updateLayout` mergea solo `main`)
- `aplicacion/backend/src/modules/diagrams/diagrams.service.js` (`saveModuleLayout`)
- `aplicacion/backend/src/modules/diagrams/diagrams.controller.js` (`saveModuleLayout`)
- `aplicacion/backend/src/modules/diagrams/diagrams.routes.js` (`PATCH /:id/modules/:moduleId/layout`)

**Modificados — frontend:**
- `aplicacion/frontend/src/modules/diagrams/core/auto-layout.js` (lee `layout.main`)
- `aplicacion/frontend/src/modules/diagrams/core/auto-layout-deep.js` (sin frontier-module, acepta `savedLayout`, devuelve `moduleDeps`)
- `aplicacion/frontend/src/modules/diagrams/services/diagrams.service.js` (`saveModuleLayout`)
- `aplicacion/frontend/src/modules/diagrams/stores/diagrams.store.js` (`saveModuleLayout`, actualiza `current.data.layout` en memoria)
- `aplicacion/frontend/src/modules/diagrams/views/ModuleDeepDiveView.vue` (snapshots, undo/redo, botones, `loadModule` + watch de params, `<CanvasModuleDeps>`)
