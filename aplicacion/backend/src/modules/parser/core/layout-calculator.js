/**
 * layout-calculator.js
 *
 * Calcula las posiciones (x, y) por defecto de todos los nodos de un diagrama a
 * partir del modelo ya parseado. Es lo que coloca las cajas la primera vez que
 * se genera un diagrama; luego el usuario puede arrastrarlas y ese layout se
 * guarda aparte.
 *
 * Responsabilidad: solo geometría/posicionamiento. No interpreta el contenido
 * de los .md (eso es model-builder.js) ni dibuja nada (eso es el frontend).
 *
 * Produce dos layouts:
 *   - main:    el canvas conceptual (database / backend / frontend / screens / flows)
 *   - modules: el deep-dive de cada módulo (archivos repartidos por carpetas)
 *
 * Las constantes de abajo son las medidas en píxeles que definen el espaciado.
 */

// ---------- Canvas conceptual ----------
const NODE_WIDTH   = 280
const NODE_HEIGHT  = 160
const V_GAP        = 60
const COL_GAP      = 120
const START_X      = 60
const COLS_START_Y = 280

const COL_X = {
  database: START_X,
  backend:  START_X + NODE_WIDTH + COL_GAP,
  frontend: START_X + (NODE_WIDTH + COL_GAP) * 2,
  screens:  START_X + (NODE_WIDTH + COL_GAP) * 3,
}

// ---------- Deep-dive de cada módulo ----------
const DD_COL_W       = 280   // ancho de cada columna-carpeta
const DD_COL_GAP     = 60    // separación entre columnas
const DD_FILE_TOP    = 80    // y del primer archivo de cada columna
const DD_FILE_GAP    = 20    // separación vertical entre archivos
const DD_FILE_BASE_H = 80    // altura mínima estimada de un FileNode
const DD_FILE_FN_H   = 18    // altura por función

/**
 * Calcula las coordenadas por defecto del diagrama completo.
 *
 * Forma de retorno:
 *   {
 *     main:    { [nodeId]: { x, y } },    // canvas conceptual
 *     modules: { [moduleId]: {            // deep-dive de cada módulo
 *       [fileNodeId]: { x, y }
 *     } }
 *   }
 *
 * Estrategia del canvas conceptual:
 *   - database | backend | frontend | screens  (columnas izq → der)
 *   - flows: fila horizontal debajo de todas las columnas
 *   - systemRules: posición fija en la esquina superior izquierda
 *
 * Estrategia del deep-dive (por módulo):
 *   - Una columna por carpeta declarada en `module.folders` (en orden)
 *   - Archivos sin carpeta caen en una columna "raíz" al final
 *   - Archivos apilados verticalmente con altura proporcional a su nº de funciones
 *
 * @param {object} model - Modelo unificado del diagrama (salida del model-builder)
 * @returns {{main: object, modules: object}} Posiciones del canvas y de cada deep-dive
 */
export function calculateLayout(model) {
  return {
    main:    calculateMainLayout(model),
    modules: calculateModuleLayouts(model),
  }
}

/**
 * Coloca los nodos del canvas conceptual en columnas (database, backend,
 * frontend, screens) y deja los flujos en una fila horizontal por debajo de
 * todas las columnas. system-rules va fijo en la esquina superior izquierda.
 *
 * @param {object} model - Modelo unificado del diagrama
 * @returns {object} Mapa { [nodeId]: { x, y } } del canvas principal
 */
function calculateMainLayout(model) {
  const layout = {}

  // system-rules: nodo global, posición fija
  if (model.systemRules && Object.keys(model.systemRules).length > 0) {
    layout['system-rules'] = { x: START_X, y: 60 }
  }

  const columns = {
    database: (model.database || []).map(e => e.id),
    backend:  (model.modules?.backend  || []).map(m => m.id),
    frontend: (model.modules?.frontend || []).map(m => m.id),
    screens:  (model.screens || []).map(s => s.id),
  }

  const columnBottoms = {}

  for (const [col, ids] of Object.entries(columns)) {
    const x = COL_X[col]
    ids.forEach((id, index) => {
      layout[id] = {
        x,
        y: COLS_START_Y + index * (NODE_HEIGHT + V_GAP),
      }
    })
    const count = ids.length
    columnBottoms[col] = count > 0
      ? COLS_START_Y + count * (NODE_HEIGHT + V_GAP)
      : COLS_START_Y
  }

  const maxBottom = Math.max(...Object.values(columnBottoms))
  const flowsY = maxBottom + V_GAP
  const flows = (model.flows || []).map(f => f.id)
  flows.forEach((id, index) => {
    layout[id] = {
      x: START_X + index * (NODE_WIDTH + COL_GAP),
      y: flowsY,
    }
  })

  return layout
}

/**
 * Calcula el layout del deep-dive de cada módulo: reparte sus archivos en
 * columnas (una por carpeta declarada, más una columna "raíz" para los archivos
 * sin carpeta) y los apila verticalmente. La altura reservada para cada archivo
 * crece con su número de funciones para que las cajas no se solapen.
 *
 * @param {object} model - Modelo unificado del diagrama
 * @returns {object} Mapa { [moduleId]: { [fileNodeId]: { x, y } } }
 */
function calculateModuleLayouts(model) {
  const result = {}
  const allModules = [
    ...(model.modules?.backend  || []),
    ...(model.modules?.frontend || []),
  ]

  for (const m of allModules) {
    const files = m.files ?? []
    if (files.length === 0) continue

    const folders = m.folders ?? []
    const byFolder = new Map()
    for (const f of folders) byFolder.set(f.id, [])
    byFolder.set('_root', [])
    for (const file of files) {
      const bucket = file.folder && byFolder.has(file.folder) ? file.folder : '_root'
      byFolder.get(bucket).push(file)
    }

    // Determina columnas con contenido en el mismo orden que el frontend.
    const columns = []
    for (const folder of folders) {
      if (byFolder.get(folder.id).length === 0) continue
      columns.push({ id: folder.id, files: byFolder.get(folder.id) })
    }
    if (byFolder.get('_root').length > 0) {
      columns.push({ id: '_root', files: byFolder.get('_root') })
    }

    const moduleLayout = {}
    const fnsByFileId = m.functions ?? {}
    columns.forEach((col, ci) => {
      const x = ci * (DD_COL_W + DD_COL_GAP)
      let y = DD_FILE_TOP
      for (const file of col.files) {
        const fnCount = Array.isArray(fnsByFileId[file.id]) ? fnsByFileId[file.id].length : 0
        const h = DD_FILE_BASE_H + Math.min(fnCount, 8) * DD_FILE_FN_H
        moduleLayout[`file-${file.id}`] = { x, y }
        y += h + DD_FILE_GAP
      }
    })

    if (Object.keys(moduleLayout).length > 0) {
      result[m.id] = moduleLayout
    }
  }

  return result
}
