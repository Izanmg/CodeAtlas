# Notas de archivo/función + panel lateral del deep-dive + carpetas con color

Conjunto de refinamientos sobre el deep-dive de módulos (que se construyó el mismo día — ver `08-05-deep-dive-modulos.md`). Tres bloques de cambios independientes pero relacionados, todos sobre la vista interna `/diagrams/:id/modules/:moduleId`.

## 1. Dos tipos de notas inline en el `.md` del módulo

El parser ya construía la jerarquía módulo → carpeta → archivo → función. Faltaba poder explicar **para qué sirve cada archivo** y **qué hace cada función**, con campos distintos para no confundirlos.

### Campos nuevos

- **`role:`** — nota a nivel archivo. Vive dentro de cada entrada de `files[]` en el frontmatter del módulo.
- **`doc:`** — nota a nivel función. Vive en el cuerpo markdown como línea indentada bajo cada firma de la sección `## Functions`.

Ejemplo en un módulo:

```yaml
files:
  - id: auth-controller
    folder: controllers
    path: auth.controller.js
    type: controller
    role: Capa HTTP. Recibe req/res, delega en el service y mapea errores conocidos.
```

```markdown
## Functions

### auth-controller
- login(req, res)
  doc: Verifica credenciales y firma un JWT con expiración 7d.
- register(req, res)
  doc: Crea usuario y devuelve el token.
```

### Cambios en el parser

`aplicacion/backend/src/modules/parser/core/model-builder.js`:
- `parseFunctions(text)` reescrita. Antes devolvía `{ [fileId]: ["fnName(args)", ...] }` (strings). Ahora devuelve `{ [fileId]: [{ signature, doc? }, ...] }` (objetos).
- Detecta líneas `  doc: ...` indentadas bajo cada bullet `- ...` y las asocia a la función previa.
- Compatible hacia atrás: las funciones sin `doc:` simplemente no tienen ese campo.
- El campo `role` se pasa automáticamente al modelo porque `files: yaml.files ?? []` no filtra subcampos.

### Documentación

`aplicacion/ia-doc/formatos/modulos.md`:
- Añadida fila para `files[].role` en la tabla de referencia.
- Nueva sub-sección "Con `doc:` por función" con ejemplo.

`aplicacion/app-doc/` — rellenados los `role` y `doc` de **todos** los archivos y funciones de los 10 módulos (5 backend + 5 frontend). Sirve como documentación viva del proyecto y como dataset de prueba del feature.

### Fix YAML pendiente

Cuatro valores de `role:` contenían `:` interior (que YAML interpreta como otra clave) y rompían el parseo. Se envolvieron en comillas simples (o dobles cuando había `'light'` interno) para escapar. Archivos arreglados: `diagrams-frontend`, `auth-backend`, `settings-frontend`, `settings-backend`.

## 2. Panel lateral para archivos del deep-dive

Originalmente el primer intento mostró las notas inline dentro del `FileNode` (chevron por función, icono Info expandible para el role). Quedaba cargado. El rediseño mueve toda la info a la barra lateral derecha (el mismo `SidePanel` que ya existe en el canvas conceptual).

### Comportamiento

- Click en cualquier `FileNode` → se abre el `SidePanel` a la derecha.
- Click en folders/frontiers → no abre nada (no tienen detalle propio).
- Click en lienzo vacío o Esc → cierra el panel.

### Cambios

- `aplicacion/frontend/src/modules/diagrams/core/node-meta.js` — añadido `file` a `NODE_META` (icono `FileText`, color `--fg-muted`).
- `aplicacion/frontend/src/modules/diagrams/core/auto-layout-deep.js` — cada nodo file lleva `_model` con `name` (path), `role`, `imports`, `functions`, `folderId`, `folderPath`, `type`. Necesario para que SidePanel los lea como cualquier otro nodo.
- `aplicacion/frontend/src/modules/diagrams/components/SidePanel.vue` — el header usa `font-mono` cuando `kind === 'file'` (para que el path se vea como código). El fallback "Reglas del sistema" solo aparece si `kind === 'rules'`.
- `aplicacion/frontend/src/modules/diagrams/views/ModuleDeepDiveView.vue` — añadido `selectedId` + `selectedNode` computed, handlers `onNodeClick`/`onPaneClick`, y `<SidePanel>` montado.

### Contenido del panel para un archivo

**Overview** (`OverviewTab`): dos stat tiles — nº de funciones y nº de imports.

**Conexiones** (`ConnectionsTab` vía `compute-connections.js`):
- Salientes: archivos que este importa (`file.imports`).
- Entrantes: otros archivos del mismo módulo que lo importan.
- Entrantes: pantallas que apuntan a este archivo vía `screen.file`.

**Detalle** (`DetailsTab`, nueva rama `kind === 'file'`) con cuatro secciones:
- **Rol** — el `role` del archivo (si existe).
- **Metadata** — carpeta + tipo en chips mono.
- **Imports** — lista de archivos importados.
- **Funciones** — cada firma es un botón. Chevron `▸` si tiene `doc`; click expande el panel con el texto.

### Simplificación del FileNode

`aplicacion/frontend/src/modules/diagrams/components/nodes/FileNode.vue` perdió la lógica de expansión interna. Ahora solo muestra:
- Cabecera con icono + path + badge de tipo + punto accent indicador (si hay role o doc en alguna función).
- Lista plana de firmas (sin chevron, sin expansión).

Lo "interactivo" se delegó al panel.

## 3. Carpetas como panel flotante + colores por archivo

Antes cada carpeta se renderizaba como un nodo extra en el canvas (con etiqueta + ruta). No se podía interactuar y ocupaba espacio. Se sustituyó por un panel flotante.

### Cambios

`aplicacion/frontend/src/modules/diagrams/core/auto-layout-deep.js`:
- Eliminada la creación de nodos `folder`. Las columnas siguen existiendo a nivel de layout (los archivos se posicionan por carpeta) pero no se renderizan.
- Nueva paleta `FOLDER_COLORS` con 8 colores distinguibles: `#7c3aed`, `#06b6d4`, `#f59e0b`, `#10b981`, `#ec4899`, `#f97316`, `#6366f1`, `#14b8a6`. Asignados por orden de aparición de las carpetas.
- Una constante `ROOT_COLOR = '#94a3b8'` (gris) para los archivos sin carpeta.
- Cada FileNode recibe `data.folderColor` y `_model.folderColor` con el color asignado.
- `buildDeepDive(module, model)` ahora devuelve también `folders: [{ id, label, path, color, fileCount }]`.

`aplicacion/frontend/src/modules/diagrams/components/CanvasFolders.vue` (nuevo):
- Mismo patrón pill ↔ panel que `CanvasRules`.
- Pill colapsado arriba a la izquierda: icono `Folder` + número de carpetas.
- Panel expandido: lista de carpetas con cuadradito de color, nombre (mono), ruta (`src/modules/...`) y contador de archivos.

`aplicacion/frontend/src/modules/diagrams/components/nodes/FileNode.vue`:
- `borderLeft: 3px solid {folderColor}` en el contenedor principal.
- El icono `FileText` del header también toma el `folderColor` (en vez del gris muted).

`aplicacion/frontend/src/modules/diagrams/views/ModuleDeepDiveView.vue`:
- Eliminado import y registro de `FolderNode`.
- Nueva ref `folders` poblada desde `buildDeepDive(...).folders`.
- `<CanvasFolders :folders="folders" />` montado en modo Relaciones (en modo Flujos sigue siendo `CanvasFlowPanel` quien ocupa esa esquina).

El componente `FolderNode.vue` se queda en disco pero deshabilitado.

## Cómo se prueba todo junto

1. Editar un módulo cualquiera en `app-doc/`, añadir `role:` a un archivo y `doc:` a varias funciones.
2. Editar el diagrama → re-subir los `.md` para regenerar el `model_json`.
3. Abrir el canvas conceptual, doble-click sobre el módulo → entra al deep-dive.
4. Arriba a la izquierda hay una pastilla `N carpetas`. Click → ves la lista con colores.
5. Cada archivo en el canvas tiene una raya del color de su carpeta a la izquierda y el icono tintado.
6. Click sobre un archivo → se abre el panel derecho con Resumen / Conexiones / Detalle.
7. En Detalle: rol, metadata, imports y funciones desplegables con sus `doc`.

## Compatibilidad

- Diagramas existentes en BD que no se regeneren siguen funcionando — las funciones se quedan como objetos `{ signature }` sin `doc`, `role` queda undefined y `folderColor` queda undefined (el `FileNode` cae al borde gris por defecto).
- Para ver toda la info nueva: editar diagrama → re-subir los `.md` actualizados.

## Archivos tocados

**Nuevos:**
- `aplicacion/frontend/src/modules/diagrams/components/CanvasFolders.vue`

**Modificados:**
- `aplicacion/backend/src/modules/parser/core/model-builder.js` (parseFunctions con doc)
- `aplicacion/ia-doc/formatos/modulos.md` (documentación de role y doc)
- `aplicacion/app-doc/modules/**` (10 módulos completados con role/doc)
- `aplicacion/frontend/src/modules/diagrams/core/node-meta.js` (file kind)
- `aplicacion/frontend/src/modules/diagrams/core/auto-layout-deep.js` (sin folder nodes, colores, _model)
- `aplicacion/frontend/src/modules/diagrams/core/compute-connections.js` (rama file)
- `aplicacion/frontend/src/modules/diagrams/components/SidePanel.vue` (header mono para file)
- `aplicacion/frontend/src/modules/diagrams/components/panel/DetailsTab.vue` (rama file)
- `aplicacion/frontend/src/modules/diagrams/components/panel/OverviewTab.vue` (rama file)
- `aplicacion/frontend/src/modules/diagrams/components/nodes/FileNode.vue` (simplificación + color)
- `aplicacion/frontend/src/modules/diagrams/views/ModuleDeepDiveView.vue` (selectedId, SidePanel, CanvasFolders)

**Deshabilitados:**
- `aplicacion/frontend/src/modules/diagrams/components/nodes/FolderNode.vue` (existe pero ya no se monta)
