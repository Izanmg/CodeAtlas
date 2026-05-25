/**
 * auto-layout.js
 *
 * Transforma el objeto { model, layout } que devuelve el parser en nodos
 * y edges listos para Vue Flow.
 *
 * Posicionamiento:
 *   - Si el campo `layout` del diagrama tiene coordenadas para un nodo,
 *     se usan directamente (provienen del backend).
 *   - Si no, se cae a la posición calculada por columna (fallback para
 *     nodos que el backend no incluyó en el layout o para datos semilla
 *     sin layout definido).
 *
 * Los edges se construyen siempre a partir del modelo — esta parte
 * es permanente y no depende del sistema de coordenadas.
 */

const COL_X = {
  database: 80,
  backend:  520,
  flow:     520,
  frontend: 1000,
  screen:   1440,
  rules:    80,
}

const TOP = 80

/**
 * @param {{ model: object, layout?: object }} data
 *   data.model  — modelo JSON unificado
 *   data.layout — mapa { [nodeId]: { x, y } } calculado por el backend.
 *                 Los IDs son los IDs del modelo (sin prefijos de Vue Flow).
 *                 Puede ser undefined o {} para usar solo el fallback.
 */
export function autoLayout({ model, layout = {} }) {
  // El layout llega ya normalizado por el backend a la forma
  //   { main: { [nodeId]: { x, y } }, modules: { ... } }
  // pero soportamos también la forma plana antigua por si llega sin pasar.
  const mainLayout = (layout && 'main' in layout) ? (layout.main || {}) : (layout || {})
  const pos = (rawId, fallback) => mainLayout[rawId] ?? fallback
  const nodes = []

  // Database (columna izquierda).
  model.database.forEach((t, i) => {
    nodes.push({
      id: `db-${t.id}`,
      type: 'database',
      position: pos(t.id, { x: COL_X.database, y: TOP + i * 230 }),
      data: { ...t, kind: 'database', _model: t },
    })
  })

  // Reglas del sistema.
  const dbBottom = TOP + model.database.length * 230
  nodes.push({
    id: 'rules',
    type: 'rules',
    position: pos('system-rules', { x: COL_X.rules, y: dbBottom + 60 }),
    data: {
      ...model.systemRules,
      kind: 'rules',
      name: 'Reglas del sistema',
      _model: model.systemRules,
    },
  })

  // Backends (columna 2).
  model.modules.backend.forEach((m, i) => {
    nodes.push({
      id: `mod-${m.id}`,
      type: 'backend',
      position: pos(m.id, { x: COL_X.backend, y: TOP + i * 220 }),
      data: { ...m, kind: 'backend', _model: m },
    })
  })

  // Los flujos ya no se renderizan como nodos del canvas: se incrustan como
  // chips dentro de los demás nodos a través del campo `flowChips` que el
  // canvas inyecta en `data` durante la construcción de la vista.

  // Frontends (columna 3).
  model.modules.frontend.forEach((m, i) => {
    nodes.push({
      id: `mod-${m.id}`,
      type: 'frontend',
      position: pos(m.id, { x: COL_X.frontend, y: TOP + i * 220 }),
      data: { ...m, kind: 'frontend', _model: m },
    })
  })

  // Pantallas (columna 4).
  // Si hay layout del backend se usa directamente; si no, se agrupa por
  // módulo con un gap entre grupos (comportamiento original de fallback).
  let screenYFallback = TOP
  model.modules.frontend.forEach((m) => {
    const screensForMod = model.screens.filter((s) => s.module === m.id)
    screensForMod.forEach((s) => {
      nodes.push({
        id: `scr-${s.id}`,
        type: 'screen',
        position: pos(s.id, { x: COL_X.screen, y: screenYFallback }),
        data: { ...s, kind: 'screen', _model: s },
      })
      screenYFallback += 130
    })
    if (screensForMod.length > 0) screenYFallback += 30
  })

  // Pantallas que no pertenecen a ningún módulo frontend conocido.
  const assignedScreenIds = new Set(
    model.modules.frontend.flatMap((m) => (m.screens || []))
  )
  model.screens
    .filter((s) => !assignedScreenIds.has(s.id))
    .forEach((s) => {
      nodes.push({
        id: `scr-${s.id}`,
        type: 'screen',
        position: pos(s.id, { x: COL_X.screen, y: screenYFallback }),
        data: { ...s, kind: 'screen', _model: s },
      })
      screenYFallback += 130
    })

  // ----- Edges -----
  const edges = []

  // Devuelve el estilo de trazo (color, grosor, opacidad, guiones) según el
  // tipo de relación que representa la arista.
  const edgeStyle = (kind) => {
    const map = {
      'consumes':        { stroke: 'var(--kind-frontend)', strokeWidth: 1.4, strokeOpacity: 0.7 },
      'uses-db':         { stroke: 'var(--kind-database)', strokeWidth: 1.2, strokeOpacity: 0.6, strokeDasharray: '3 3' },
      'contains-screen': { stroke: 'var(--kind-screen)',   strokeWidth: 1.1, strokeOpacity: 0.5 },
      'navigates':       { stroke: 'var(--kind-screen)',   strokeWidth: 1,   strokeOpacity: 0.4, strokeDasharray: '2 4' },
      'backend-dep':     { stroke: 'var(--kind-backend)',  strokeWidth: 1.2, strokeOpacity: 0.55, strokeDasharray: '4 3' },
      'frontend-dep':    { stroke: 'var(--kind-frontend)', strokeWidth: 1.1, strokeOpacity: 0.45, strokeDasharray: '4 3' },
      'db-rel':          { stroke: 'var(--kind-database)', strokeWidth: 1.4, strokeOpacity: 0.85 },
    }
    return map[kind] ?? {}
  }

  // Backend → backend (dependsOn)
  model.modules.backend.forEach((m) => {
    ;(m.dependsOn || []).forEach((target) => {
      edges.push({
        id: `e-bd-${m.id}-${target}`,
        source: `mod-${m.id}`,
        target: `mod-${target}`,
        type: 'floating',
        style: edgeStyle('backend-dep'),
        data: { kind: 'backend-dep' },
      })
    })
  })

  // Frontend → frontend (dependsOn)
  model.modules.frontend.forEach((m) => {
    ;(m.dependsOn || []).forEach((target) => {
      edges.push({
        id: `e-fd-${m.id}-${target}`,
        source: `mod-${m.id}`,
        target: `mod-${target}`,
        type: 'floating',
        style: edgeStyle('frontend-dep'),
        data: { kind: 'frontend-dep' },
      })
    })
  })

  // Frontend → backend (consumesApi)
  model.modules.frontend.forEach((m) => {
    ;(m.consumesApi || []).forEach((target) => {
      edges.push({
        id: `e-${m.id}-${target}`,
        source: `mod-${m.id}`,
        target: `mod-${target}`,
        type: 'floating',
        style: edgeStyle('consumes'),
        data: { kind: 'consumes' },
      })
    })
  })

  // Backend → database
  model.modules.backend.forEach((m) => {
    ;(m.database || []).forEach((tableId) => {
      edges.push({
        id: `e-${m.id}-${tableId}`,
        source: `mod-${m.id}`,
        target: `db-${tableId}`,
        type: 'floating',
        style: edgeStyle('uses-db'),
        data: { kind: 'uses-db' },
      })
    })
  })

  // Frontend → screens
  model.modules.frontend.forEach((m) => {
    ;(m.screens || []).forEach((scrId) => {
      edges.push({
        id: `e-${m.id}-scr-${scrId}`,
        source: `mod-${m.id}`,
        target: `scr-${scrId}`,
        type: 'floating',
        style: edgeStyle('contains-screen'),
        data: { kind: 'contains-screen' },
      })
    })
  })

  // Screen → screen (navigatesTo)
  model.screens.forEach((s) => {
    ;(s.navigatesTo || []).forEach((target) => {
      edges.push({
        id: `e-nav-${s.id}-${target}`,
        source: `scr-${s.id}`,
        target: `scr-${target}`,
        type: 'floating',
        style: edgeStyle('navigates'),
        data: { kind: 'navigates' },
      })
    })
  })

  // Database → database (FK / relations).
  // Deduplica por par no ordenado: si A declara una relación con B y B
  // declara la inversa, solo se pinta una arista.
  const dbPairs = new Set()
  const dbIds = new Set(model.database.map((e) => e.id))
  model.database.forEach((e) => {
    ;(e.relations || []).forEach((rel) => {
      if (!rel?.target || !dbIds.has(rel.target)) return
      const pair = [e.id, rel.target].sort().join('::')
      if (dbPairs.has(pair)) return
      dbPairs.add(pair)
      edges.push({
        id: `e-rel-${e.id}-${rel.target}`,
        source: `db-${e.id}`,
        target: `db-${rel.target}`,
        type: 'floating',
        style: edgeStyle('db-rel'),
        data: { kind: 'db-rel', relType: rel.type },
      })
    })
  })

  return { nodes, edges }
}
