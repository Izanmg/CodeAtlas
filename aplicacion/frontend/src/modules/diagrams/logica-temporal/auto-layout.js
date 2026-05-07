/**
 * auto-layout.js
 *
 * Posicionamiento automático de nodos del diagrama y construcción de las
 * conexiones (edges) a partir del modelo JSON unificado.
 *
 * Puerto directo del `autoLayout` del prototipo de Claude Design — mismas
 * coordenadas, mismos colores y mismas etiquetas. Cuando el backend
 * empiece a enviar coordenadas guardadas, esta función seguirá usándose
 * como fallback para nodos sin posición asignada.
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
 * Construye los nodos y edges para Vue Flow a partir del modelo del
 * diagrama. Devuelve `{ nodes, edges }` listos para pasar a `<VueFlow />`.
 */
export function autoLayout(model) {
  const nodes = []

  // Database (columna izquierda).
  model.database.forEach((t, i) => {
    nodes.push({
      id: `db-${t.id}`,
      type: 'database',
      position: { x: COL_X.database, y: TOP + i * 230 },
      data: { ...t, kind: 'database', _model: t },
    })
  })

  // Reglas del sistema, justo debajo de la columna database.
  const dbBottom = TOP + model.database.length * 230
  nodes.push({
    id: 'rules',
    type: 'rules',
    position: { x: COL_X.rules, y: dbBottom + 60 },
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
      position: { x: COL_X.backend, y: TOP + i * 220 },
      data: { ...m, kind: 'backend', _model: m },
    })
  })

  // Flujos: bajo la columna de backends.
  const backendBottom = TOP + model.modules.backend.length * 220
  model.flows.forEach((f, i) => {
    nodes.push({
      id: `flow-${f.id}`,
      type: 'flow',
      position: { x: COL_X.flow, y: backendBottom + 60 + i * 140 },
      data: { ...f, kind: 'flow', _model: f },
    })
  })

  // Frontends (columna 3).
  model.modules.frontend.forEach((m, i) => {
    nodes.push({
      id: `mod-${m.id}`,
      type: 'frontend',
      position: { x: COL_X.frontend, y: TOP + i * 220 },
      data: { ...m, kind: 'frontend', _model: m },
    })
  })

  // Pantallas (columna 4) — agrupadas por su módulo padre, con un gap
  // entre grupos para distinguir visualmente.
  let screenY = TOP
  model.modules.frontend.forEach((m) => {
    const screensForMod = model.screens.filter((s) => s.module === m.id)
    screensForMod.forEach((s) => {
      nodes.push({
        id: `scr-${s.id}`,
        type: 'screen',
        position: { x: COL_X.screen, y: screenY },
        data: { ...s, kind: 'screen', _model: s },
      })
      screenY += 130
    })
    if (screensForMod.length > 0) screenY += 30
  })

  // ----- Edges -----
  const edges = []
  const styleFor = (kind) => {
    const map = {
      'consumes':         { stroke: 'var(--kind-frontend)', w: 1.4, dash: undefined,  op: 0.7 },
      'uses-db':          { stroke: 'var(--kind-database)', w: 1.2, dash: '3 3',      op: 0.6 },
      'contains-screen':  { stroke: 'var(--kind-screen)',   w: 1.1, dash: undefined,  op: 0.5 },
      'navigates':        { stroke: 'var(--kind-screen)',   w: 1,   dash: '2 4',      op: 0.4 },
      'backend-dep':      { stroke: 'var(--kind-backend)',  w: 1.2, dash: '4 3',      op: 0.55 },
      'frontend-dep':     { stroke: 'var(--kind-frontend)', w: 1.1, dash: '4 3',      op: 0.45 },
    }
    return map[kind]
  }

  const edgeStyle = (kind) => {
    const c = styleFor(kind)
    return { stroke: c.stroke, strokeWidth: c.w, strokeOpacity: c.op, strokeDasharray: c.dash }
  }

  // Backend → backend (dependsOn)
  model.modules.backend.forEach((m) => {
    (m.dependsOn || []).forEach((target) => {
      edges.push({
        id: `e-bd-${m.id}-${target}`,
        source: `mod-${m.id}`,
        target: `mod-${target}`,
        type: 'smoothstep',
        style: edgeStyle('backend-dep'),
        data: { kind: 'backend-dep' },
      })
    })
  })

  // Frontend → frontend (dependsOn)
  model.modules.frontend.forEach((m) => {
    (m.dependsOn || []).forEach((target) => {
      edges.push({
        id: `e-fd-${m.id}-${target}`,
        source: `mod-${m.id}`,
        target: `mod-${target}`,
        type: 'smoothstep',
        style: edgeStyle('frontend-dep'),
        data: { kind: 'frontend-dep' },
      })
    })
  })

  // Frontend → backend (consumesApi)
  model.modules.frontend.forEach((m) => {
    (m.consumesApi || []).forEach((target) => {
      edges.push({
        id: `e-${m.id}-${target}`,
        source: `mod-${m.id}`, sourceHandle: 'l',
        target: `mod-${target}`, targetHandle: 'r',
        type: 'smoothstep',
        style: edgeStyle('consumes'),
        data: { kind: 'consumes' },
      })
    })
  })

  // Backend → database
  model.modules.backend.forEach((m) => {
    (m.database || []).forEach((tableId) => {
      edges.push({
        id: `e-${m.id}-${tableId}`,
        source: `mod-${m.id}`, sourceHandle: 'l',
        target: `db-${tableId}`, targetHandle: 'r',
        type: 'smoothstep',
        style: edgeStyle('uses-db'),
        data: { kind: 'uses-db' },
      })
    })
  })

  // Frontend → screens
  model.modules.frontend.forEach((m) => {
    (m.screens || []).forEach((scrId) => {
      edges.push({
        id: `e-${m.id}-scr-${scrId}`,
        source: `mod-${m.id}`, sourceHandle: 'r',
        target: `scr-${scrId}`, targetHandle: 'l',
        type: 'smoothstep',
        style: edgeStyle('contains-screen'),
        data: { kind: 'contains-screen' },
      })
    })
  })

  // Screen → screen (navigatesTo)
  model.screens.forEach((s) => {
    (s.navigatesTo || []).forEach((target) => {
      edges.push({
        id: `e-nav-${s.id}-${target}`,
        source: `scr-${s.id}`,
        target: `scr-${target}`,
        type: 'smoothstep',
        style: edgeStyle('navigates'),
        data: { kind: 'navigates' },
      })
    })
  })

  return { nodes, edges }
}
