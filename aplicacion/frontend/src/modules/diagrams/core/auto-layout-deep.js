/**
 * auto-layout-deep.js
 *
 * Construye nodos + edges del "deep-dive" de un módulo concreto.
 *
 * El canvas interno representa la estructura de archivos como un UML:
 *   - Cada folder se renderiza como un contenedor visual con un label.
 *   - Cada file es un nodo UML con su tipo y la lista de funciones.
 *   - En el borde izquierdo aparecen "frontier nodes" para las pantallas
 *     que apuntan a algún archivo de este módulo (vía screen.file).
 *   - En el borde derecho aparecen frontier nodes para los módulos a los
 *     que este depende (module.dependsOn / consumesApi).
 *
 * Las edges internas se construyen a partir de file.imports.
 */

const COL_FOLDER_W = 280   // ancho de cada columna-carpeta
const COL_GAP = 60         // separación entre columnas
const FOLDER_TOP = 60      // y donde empiezan las cabeceras de carpeta
const FILE_TOP = 110       // y del primer archivo dentro de la carpeta
const FILE_GAP = 20        // separación vertical entre archivos
const FILE_BASE_H = 80     // altura mínima estimada de un FileNode
const FILE_FN_H = 18       // altura por función
const FRONTIER_W = 200
const FRONTIER_GAP = 40

/**
 * @param {object} module — objeto del modelo (model.modules.backend[i] o frontend[i])
 * @param {object} model  — modelo completo (para resolver pantallas y módulos cruzados)
 * @returns {{ nodes: Array, edges: Array }}
 */
export function buildDeepDive(module, model) {
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
  const columns = []
  for (const folder of folders) {
    if (byFolder.get(folder.id).length === 0) continue
    columns.push({
      id: folder.id,
      label: folder.id,
      path: folder.path,
      files: byFolder.get(folder.id),
    })
  }
  if (byFolder.get('_root').length > 0) {
    columns.push({
      id: '_root',
      label: 'raíz',
      path: '',
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
  const FRONTIER_X_LEFT = -FRONTIER_W - 80   // a la izquierda de la primera columna
  const totalWidth = columns.length * (COL_FOLDER_W + COL_GAP)
  const FRONTIER_X_RIGHT = totalWidth + 60

  // Cabecera + caja de cada folder.
  columns.forEach((col, ci) => {
    const x = ci * (COL_FOLDER_W + COL_GAP)
    let y = FILE_TOP

    nodes.push({
      id: `folder-${col.id}`,
      type: 'folder',
      position: { x, y: FOLDER_TOP },
      data: {
        kind: 'folder',
        name: col.label,
        path: col.path,
        fileCount: col.files.length,
        width: COL_FOLDER_W,
      },
      draggable: false,
      selectable: false,
    })

    for (const file of col.files) {
      const h = FILE_BASE_H + Math.min(file.functions.length, 8) * FILE_FN_H
      nodes.push({
        id: `file-${file.id}`,
        type: 'file',
        position: { x, y },
        data: {
          kind: 'file',
          fileId: file.id,
          path: file.path,
          fileType: file.type,
          functions: file.functions,
          width: COL_FOLDER_W,
        },
      })
      y += h + FILE_GAP
    }
  })

  // Frontiers de pantallas (izquierda).
  incomingScreens.forEach((s, i) => {
    nodes.push({
      id: `frontier-screen-${s.id}`,
      type: 'frontier',
      position: { x: FRONTIER_X_LEFT, y: FILE_TOP + i * (60 + FRONTIER_GAP) },
      data: {
        kind: 'frontier',
        frontierType: 'screen',
        name: s.name,
        sub: (s.routes && s.routes[0]) || '',
        targetFileId: s.file,
        width: FRONTIER_W,
      },
      draggable: false,
    })
  })

  // Frontiers de módulos (derecha).
  outgoingModules.forEach((m, i) => {
    nodes.push({
      id: `frontier-module-${m.id}`,
      type: 'frontier',
      position: { x: FRONTIER_X_RIGHT, y: FILE_TOP + i * (60 + FRONTIER_GAP) },
      data: {
        kind: 'frontier',
        frontierType: m.layer || 'backend',
        name: m.name,
        sub: m.id,
        moduleId: m.id,
        width: FRONTIER_W,
      },
      draggable: false,
    })
  })

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

  // screen.file → edge frontier-screen → file (binding pantalla-archivo).
  incomingScreens.forEach((s) => {
    if (!localFileIds.has(s.file)) return
    edges.push({
      id: `bind-${s.id}-${s.file}`,
      source: `frontier-screen-${s.id}`,
      target: `file-${s.file}`,
      type: 'floating',
      style: { stroke: 'var(--kind-screen)', strokeWidth: 1.4, strokeOpacity: 0.85 },
      data: { kind: 'binding' },
    })
  })

  return { nodes, edges }
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
