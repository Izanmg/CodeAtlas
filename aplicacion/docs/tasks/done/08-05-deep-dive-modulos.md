# Deep-dive de módulos — vista UML interna

Feature nueva: cuando se hace **doble-click sobre un módulo** (backend o frontend) en el canvas conceptual, se abre una vista nueva que muestra la **estructura interna** del módulo como un diagrama UML mejorado: carpetas como columnas, archivos como nodos UML con su lista de funciones, y aristas entre ellos.

## Motivación

El parser ya guardaba `folders`, `files`, `functions`, el vínculo `screen.file` y los `step.file` / `step.fn` de los flujos. Toda esa información solo se mostraba enterrada en un árbol colapsable del side panel. La vista nueva la rentabiliza dándole un canvas propio.

El feature se planteó en tres niveles de complejidad. Se han implementado los **niveles 1 y 2**:
- **Nivel 1 (gratis)** — usar datos ya parseados: pantallas, dependencias entre módulos y pasos de flujos.
- **Nivel 2 (un campo nuevo)** — `file.imports` para declarar dependencias entre archivos del mismo módulo.
- **Nivel 3 (descartado)** — `function.calls` para grafos llamada→llamada. Se evaluó como demasiado frágil y costoso de documentar.

## Cambios — Backend

### Schema y validación

**`aplicacion/backend/src/modules/parser/core/resolver.js`**
Nueva función `checkFileImports(model)` que recorre todos los módulos y avisa si un `file.imports` apunta a un id que no existe en el mismo módulo. Las dependencias entre módulos siguen viviendo en `module.depends-on` (validación ya existente).

**Decisión clave**: `imports` solo permite IDs del mismo módulo. Cross-module = frontier node en el borde del deep-dive. Mantiene el grafo manejable y conceptualmente limpio.

### Documentación

**`aplicacion/ia-doc/formatos/modulos.md`**
- Añadida fila para `files[].imports` en la tabla de referencia de campos.
- Añadido `imports: [...]` en el ejemplo del módulo backend.

El campo pasa al modelo automáticamente — `model-builder.js` ya hacía `files: yaml.files ?? []` sin filtrar subcampos, así que **no requirió cambios en el parser**.

## Cambios — Frontend

### Routing

**`aplicacion/frontend/src/router/index.js`**
Nueva ruta:
```js
{
  path: '/diagrams/:id/modules/:moduleId',
  name: 'module-deep-dive',
  component: () => import('@/modules/diagrams/views/ModuleDeepDiveView.vue'),
  meta: { requiresAuth: true },
}
```

### Lógica de layout

**`aplicacion/frontend/src/modules/diagrams/core/auto-layout-deep.js`** *(archivo nuevo)*

Dos funciones:
- `buildDeepDive(module, model)` — devuelve `{ nodes, edges }` para el canvas interno:
  - Una columna vertical por carpeta. Carpetas vacías se omiten. Archivos sin folder se agrupan bajo "raíz".
  - **Frontier nodes a la izquierda**: pantallas que tengan `screen.module === module.id` y `screen.file` rellenado.
  - **Frontier nodes a la derecha**: módulos en `module.dependsOn` y `module.consumesApi` (frontend).
  - **Edges**: `file.imports` (estilo neutro), `screen.file` binding (estilo color screen).
- `buildFlowEdgesForModule(flow, module)` — calcula edges numeradas (1, 2, 3…) entre archivos del módulo basándose en `step.file` y `step.fn` consecutivos.

Constantes de posicionamiento centralizadas: `COL_FOLDER_W=280`, `COL_GAP=60`, `FILE_BASE_H=80`, etc.

### Componentes de nodo

Tres nuevos en `aplicacion/frontend/src/modules/diagrams/components/nodes/`:

- **`FileNode.vue`** — nodo UML con header (icono `FileText` + path mono + badge de tipo) y cuerpo con la lista de funciones. Hereda de `NodeHandles` para soportar floating edges.
- **`FolderNode.vue`** — etiqueta visual sobre cada columna. Es solo cabecera, no es un container real (los archivos no son hijos en términos de Vue Flow). `draggable: false, selectable: false`.
- **`FrontierNode.vue`** — caja pequeña dashed con icono según tipo (`Monitor` para screen, `Server` para backend, `Layout` para frontend). Indica un punto de entrada/salida del módulo.

Todos llevan `defineOptions({ inheritAttrs: false })` para evitar los warnings de Vue cuando Vue Flow pasa props que el componente no declara.

### Vista principal

**`aplicacion/frontend/src/modules/diagrams/views/ModuleDeepDiveView.vue`** *(archivo nuevo)*

Estructura:
- Topbar con botón "Salir" (← + Esc), breadcrumb (`diagrama / módulo`), badge de capa, y toggle Relaciones/Flujos.
- Lienzo VueFlow con los nodeTypes nuevos + `FloatingEdge` reutilizado.
- En modo Flujos: reutiliza `CanvasFlowSelector` (lista de flujos a la derecha) y `CanvasFlowPanel` (pasos del flujo activo a la izquierda).
- Modo flujos atenúa las edges base (opacity 0.18) y superpone la secuencia numerada del flujo activo. Si no hay flujo seleccionado, agrega edges de todos.
- Estado vacío con mensaje cuando el módulo no tiene `files` documentados.

### Wire del doble-click

**`aplicacion/frontend/src/modules/diagrams/views/DiagramView.vue`**
Nueva función `onNodeDoubleClick({ node })`:
- Filtra por `node.data.kind === 'backend' || 'frontend'` (los únicos con estructura interna).
- Limpia el prefijo `mod-` del id y hace `router.push(\`/diagrams/${id}/modules/${moduleId}\`)`.
- Wired con `@node-double-click="onNodeDoubleClick"` en `<VueFlow>`.

## Cómo se prueba

1. Abre cualquier diagrama existente con módulos backend/frontend.
2. Doble-click sobre un módulo → entras al deep-dive.
3. Ves carpetas como columnas con sus archivos UML dentro. Pantallas con `screen.file` aparecen como frontiers a la izquierda; módulos en `dependsOn` aparecen como frontiers a la derecha.
4. Toggle a "Flujos" → selecciona un flujo del panel derecho → ves la secuencia numerada entre las funciones que ese flujo recorre dentro del módulo.
5. Esc o "Salir" → vuelves al diagrama conceptual.

## Compatibilidad y migración

- **Diagramas existentes en BD seguirán funcionando** — el feature es aditivo. Sin `file.imports`, simplemente no aparecerán edges internas estáticas, solo bindings desde pantallas y los flujos.
- Para que aparezcan edges file→file, los `.md` de módulos necesitan el campo nuevo. Hay que regenerar el diagrama (editar → re-subir archivos) si se añade.
- Los diagramas sin `folders/files/functions` documentados muestran un mensaje "este módulo no tiene archivos documentados".

## Limitaciones conocidas (v1)

- **No hay persistencia del layout interno**: cada vez que entras al deep-dive se recalculan las posiciones. Se podrá añadir guardando un layout secundario por módulo en una iteración posterior.
- **Frontiers de módulos dependidos no llevan edges**: solo son cajas informativas. Para conectarlas con archivos concretos haría falta extender `imports` a cross-module o introducir un campo nuevo (decisión pendiente).
- **No hay panel lateral en el deep-dive**: clicar un archivo no abre detalles. Se podrá reutilizar `SidePanel.vue` en una iteración posterior.
- **Endpoints no se vinculan a controllers automáticamente**: el plan original mencionaba inferir `endpoint → controller.fn` por heurística. Pendiente.

## Archivos tocados

**Nuevos:**
- `aplicacion/frontend/src/modules/diagrams/views/ModuleDeepDiveView.vue`
- `aplicacion/frontend/src/modules/diagrams/core/auto-layout-deep.js`
- `aplicacion/frontend/src/modules/diagrams/components/nodes/FileNode.vue`
- `aplicacion/frontend/src/modules/diagrams/components/nodes/FolderNode.vue`
- `aplicacion/frontend/src/modules/diagrams/components/nodes/FrontierNode.vue`

**Modificados:**
- `aplicacion/backend/src/modules/parser/core/resolver.js` (validación de imports)
- `aplicacion/ia-doc/formatos/modulos.md` (documentación + ejemplo)
- `aplicacion/frontend/src/router/index.js` (ruta nueva)
- `aplicacion/frontend/src/modules/diagrams/views/DiagramView.vue` (handler doble-click)
