/**
 * auto-layout-deep.js
 *
 * Construye nodos + edges del "deep-dive" de un módulo concreto.
 *
 * El canvas interno representa la estructura de archivos como un UML:
 *   - Las carpetas se muestran en el panel CanvasFolders (no como nodos).
 *   - Cada file es un nodo UML con su tipo y la lista de funciones.
 *   - Las edges internas son archivo→archivo vía file.imports.
 *
 * Las pantallas vinculadas (screen.file) y los módulos dependidos
 * (dependsOn / consumesApi) se devuelven como `screenDeps` y `moduleDeps`
 * para que la vista los muestre en el panel CanvasModuleDeps (esquina
 * superior derecha). Antes eran "frontier nodes" en el canvas — se
 * movieron al panel para no ensuciar el lienzo.
 */

const COL_FOLDER_W = 280   // ancho de cada columna-carpeta
const COL_GAP = 60         // separación entre columnas
const FILE_TOP = 80        // y del primer archivo de cada columna
const FILE_GAP = 20        // separación vertical entre archivos
const FILE_BASE_H = 80     // altura mínima estimada de un FileNode
const FILE_FN_H = 18       // altura por función

// Paleta de colores asignada por orden a las carpetas. Diseñada para que
// cada carpeta sea distinguible en ambos temas (claro y oscuro).
const FOLDER_COLORS = [
  '#7c3aed', // violeta
  '#06b6d4', // cyan
  '#f59e0b', // ámbar
  '#10b981', // esmeralda
  '#ec4899', // rosa
  '#f97316', // naranja
  '#6366f1', // índigo
  '#14b8a6', // teal
]
const ROOT_COLOR = '#94a3b8' // gris neutro para los archivos sin carpeta

/**
 * @param {object} module — objeto del modelo (model.modules.backend[i] o frontend[i])
 * @param {object} model  — modelo completo (para resolver pantallas y módulos cruzados)
 * @param {object} [savedLayout] — posiciones guardadas para este módulo
 *                                  (`layout.modules[module.id]`); si una entrada
 *                                  no existe se usa la posición por defecto.
 * @returns {{ nodes: Array, edges: Array, folders: Array }}
 */
export function buildDeepDive(module, model, savedLayout = {}) {
  const folders = module.folders ?? []
  const files = module.files ?? []
  const functions = module.functions ?? {}

  // Agrupa archivos por folder; los sin folder caen en bucket "_root".
  const byFolder = new Map()
  for (const f of folders) byFolder.set(f.id, [])
  byFolder.set('_root', [])
  for (const file of files) {
    const bucket = file.folder && byFolder.has(file.folder) ? file.folder : '_root'
    const enriched = { ...file, functions: functions[file.id] ?? [] }
    byFolder.get(bucket).push(enriched)
  }

  // Determina las columnas que efectivamente tienen contenido.
  // Asigna un color a cada columna en orden (las carpetas-de-yaml van
  // primero; la columna "raíz" reusa un gris neutro).
  const columns = []
  let colorIdx = 0
  for (const folder of folders) {
    if (byFolder.get(folder.id).length === 0) continue
    columns.push({
      id: folder.id,
      label: folder.id,
      path: folder.path,
      color: FOLDER_COLORS[colorIdx % FOLDER_COLORS.length],
      files: byFolder.get(folder.id),
    })
    colorIdx++
  }
  if (byFolder.get('_root').length > 0) {
    columns.push({
      id: '_root',
      label: 'raíz',
      path: '',
      color: ROOT_COLOR,
      files: byFolder.get('_root'),
    })
  }

  // Frontiers: pantallas que apuntan a archivos de este módulo (capa frontend).
  const incomingScreens = (module.layer === 'frontend')
    ? (model.screens || []).filter((s) =>
        s.module === module.id && s.file
      )
    : []

  // Frontiers: módulos relacionados (dependsOn + consumesApi para frontend).
  const outgoingModuleIds = new Set([
    ...(module.dependsOn ?? []),
    ...(module.consumesApi ?? []),
  ])
  const allOtherModules = [
    ...model.modules.backend,
    ...model.modules.frontend,
  ].filter((m) => m.id !== module.id)
  const outgoingModules = [...outgoingModuleIds]
    .map((id) => allOtherModules.find((m) => m.id === id))
    .filter(Boolean)

  // ---- Posicionamiento ----
  const nodes = []

  // Las columnas ya no llevan un nodo "folder" — esa información se
  // muestra en el panel flotante CanvasFolders. Cada archivo lleva el
  // color de su columna en `data.folderColor` para que el FileNode
  // pueda pintar un acento de ese color.
  columns.forEach((col, ci) => {
    const x = ci * (COL_FOLDER_W + COL_GAP)
    let y = FILE_TOP

    for (const file of col.files) {
      const h = FILE_BASE_H + Math.min(file.functions.length, 8) * FILE_FN_H
      const nodeId = `file-${file.id}`
      // Si hay posición guardada para este FileNode, la usamos en lugar
      // del default por columna.
      const position = savedLayout[nodeId] ?? { x, y }
      nodes.push({
        id: nodeId,
        type: 'file',
        position,
        data: {
          kind: 'file',
          fileId: file.id,
          path: file.path,
          fileType: file.type,
          role: file.role,
          functions: file.functions,
          folderColor: col.color,
          width: COL_FOLDER_W,
          // _model permite que SidePanel y sus tabs reciban el archivo
          // como cualquier otro nodo del modelo conceptual.
          _model: {
            id: file.id,
            name: file.path,
            description: null,
            type: file.type,
            role: file.role,
            imports: file.imports,
            functions: file.functions,
            folderId: col.id,
            folderPath: col.path,
            folderColor: col.color,
          },
        },
      })
      y += h + FILE_GAP
    }
  })

  // Ni las pantallas vinculadas (incomingScreens) ni los módulos dependidos
  // (outgoingModules) se renderizan como nodos del canvas — ambos viven en
  // el panel CanvasModuleDeps de la esquina superior derecha. Se devuelven
  // abajo para que la vista los pase al panel.

  // ---- Edges ----
  const edges = []
  const localFileIds = new Set(files.map((f) => f.id))

  // file.imports → edge file→file (estática, color neutro).
  files.forEach((f) => {
    for (const target of (f.imports ?? [])) {
      if (!localFileIds.has(target)) continue
      edges.push({
        id: `imp-${f.id}-${target}`,
        source: `file-${f.id}`,
        target: `file-${target}`,
        type: 'floating',
        style: { stroke: 'var(--fg-faint)', strokeWidth: 1.3, strokeOpacity: 0.7 },
        data: { kind: 'import' },
      })
    }
  })

  // Lista de carpetas (con color asignado) para que el panel flotante
  // pueda renderizarlas en el orden correcto.
  const foldersOut = columns.map((col) => ({
    id: col.id,
    label: col.label,
    path: col.path,
    color: col.color,
    fileCount: col.files.length,
  }))

  // Lista de módulos dependidos (para el panel CanvasModuleDeps).
  const moduleDeps = outgoingModules.map((m) => ({
    id: m.id,
    name: m.name,
    layer: m.layer || 'backend',
    via: module.consumesApi?.includes(m.id) ? 'consumes-api' : 'depends-on',
  }))

  // Lista de pantallas vinculadas a algún archivo del módulo (frontends).
  // Solo se incluyen las que el archivo destino existe en este módulo.
  const screenDeps = incomingScreens
    .filter((s) => localFileIds.has(s.file))
    .map((s) => ({
      id: s.id,
      name: s.name,
      route: (s.routes && s.routes[0]) || '',
      fileId: s.file,
    }))

  return { nodes, edges, folders: foldersOut, moduleDeps, screenDeps }
}

/**
 * Calcula edges numeradas para el flujo activo dentro del módulo.
 * Recorre los pasos en orden, y para cada par consecutivo donde ambos pasos
 * caen sobre archivos de este módulo, genera una edge numerada por orden de
 * aparición. Si la misma transición se repite N veces, mantenemos los
 * números (1, 5, 8…) para no perder la secuencia.
 */
export function buildFlowEdgesForModule(flow, module) {
  if (!flow) return []
  const localFileIds = new Set((module.files ?? []).map((f) => f.id))
  const steps = flow.steps || []
  const edges = []
  let edgeIdx = 0
  for (let i = 0; i < steps.length - 1; i++) {
    const a = steps[i]
    const b = steps[i + 1]
    if (!a.file || !b.file) continue
    if (!localFileIds.has(a.file) || !localFileIds.has(b.file)) continue
    if (a.file === b.file) continue
    edgeIdx++
    edges.push({
      id: `flow-${flow.id}-${i}`,
      source: `file-${a.file}`,
      target: `file-${b.file}`,
      type: 'floating',
      animated: true,
      label: String(edgeIdx),
      style: {
        stroke: 'var(--kind-flow)',
        strokeWidth: 1.8,
        strokeDasharray: '5 3',
      },
      data: { kind: 'flow-step', sourceFn: a.fn, targetFn: b.fn },
    })
  }
  return edges
}
