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

/**
 * Calcula las coordenadas por defecto de cada nodo a partir del modelo.
 * Devuelve un objeto layout { [nodeId]: { x, y } }.
 *
 * Estrategia:
 *   - database | backend | frontend | screens  (columnas izq → der)
 *   - flows: fila horizontal debajo de todas las columnas
 *   - systemRules: posición fija en la esquina superior izquierda
 */
export function calculateLayout(model) {
  const layout = {}

  // system-rules: nodo global, posición fija
  if (model.systemRules && Object.keys(model.systemRules).length > 0) {
    layout['system-rules'] = { x: START_X, y: 60 }
  }

  // columnas: database, backend, frontend, screens
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

  // flows: debajo de la columna más larga
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
