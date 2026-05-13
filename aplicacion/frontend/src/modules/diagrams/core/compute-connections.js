/**
 * compute-connections.js
 *
 * Calcula las conexiones entrantes y salientes de un nodo dado del
 * diagrama, dependiendo de su tipo. Lo consume el side panel para
 * pintar las pestañas "Resumen" y "Conexiones".
 *
 * Puerto del `computeConnections` del prototipo de Claude Design.
 */

/**
 * @param {object} node     — nodo de Vue Flow seleccionado actualmente
 * @param {object} model    — modelo JSON unificado del diagrama
 * @returns {{ incoming: Array, outgoing: Array, total: number }}
 */
export function computeConnections(node, model) {
  const m = node.data._model
  const kind = node.data.kind
  const result = { incoming: [], outgoing: [], total: 0 }

  const out = (id, label, type, viaLabel) =>
    result.outgoing.push({ id, label, type, viaLabel })
  const inc = (id, label, type, viaLabel) =>
    result.incoming.push({ id, label, type, viaLabel })

  if (kind === 'backend') {
    (m.database || []).forEach((t) => {
      const tab = model.database.find((x) => x.id === t)
      if (tab) out(`db-${t}`, tab.name, 'database', 'usa tabla')
    })
    ;(m.dependsOn || []).forEach((d) => {
      const dep = model.modules.backend.find((x) => x.id === d)
      if (dep) out(`mod-${d}`, dep.name, 'backend', 'depende de')
    })
    model.modules.frontend.forEach((f) => {
      if ((f.consumesApi || []).includes(m.id)) {
        inc(`mod-${f.id}`, f.name, 'frontend', 'consume API')
      }
    })
    model.modules.backend.forEach((b) => {
      if ((b.dependsOn || []).includes(m.id)) {
        inc(`mod-${b.id}`, b.name, 'backend', 'depende de')
      }
    })
  } else if (kind === 'frontend') {
    (m.screens || []).forEach((s) => {
      const scr = model.screens.find((x) => x.id === s)
      if (scr) out(`scr-${s}`, scr.name, 'screen', 'contiene pantalla')
    })
    ;(m.consumesApi || []).forEach((b) => {
      const back = model.modules.backend.find((x) => x.id === b)
      if (back) out(`mod-${b}`, back.name, 'backend', 'consume API')
    })
    ;(m.dependsOn || []).forEach((d) => {
      const dep = model.modules.frontend.find((x) => x.id === d)
      if (dep) out(`mod-${d}`, dep.name, 'frontend', 'depende de')
    })
    model.modules.frontend.forEach((f) => {
      if ((f.dependsOn || []).includes(m.id)) {
        inc(`mod-${f.id}`, f.name, 'frontend', 'depende de')
      }
    })
  } else if (kind === 'screen') {
    const parent = model.modules.frontend.find((f) => f.id === m.module)
    if (parent) inc(`mod-${parent.id}`, parent.name, 'frontend', 'pertenece a')
    ;(m.navigatesTo || []).forEach((s) => {
      const to = model.screens.find((x) => x.id === s)
      if (to) out(`scr-${s}`, to.name, 'screen', 'navega a')
    })
    model.screens.forEach((s) => {
      if ((s.navigatesTo || []).includes(m.id)) {
        inc(`scr-${s.id}`, s.name, 'screen', 'navega desde')
      }
    })
  } else if (kind === 'database') {
    model.modules.backend.forEach((b) => {
      if ((b.database || []).includes(m.id)) {
        inc(`mod-${b.id}`, b.name, 'backend', 'usa tabla')
      }
    })
    ;(m.relations || []).forEach((r) => {
      const tab = model.database.find((x) => x.id === r.target)
      if (tab) out(`db-${r.target}`, tab.name, 'database', r.type)
    })
  } else if (kind === 'file') {
    const fileId = m.id
    const allModules = [...model.modules.backend, ...model.modules.frontend]
    const parentModule = allModules.find((mod) =>
      (mod.files || []).some((f) => f.id === fileId)
    )
    if (!parentModule) {
      result.total = 0
      return result
    }
    const files = parentModule.files || []
    // Salientes: file.imports (otros archivos del mismo módulo)
    for (const targetId of (m.imports || [])) {
      const tf = files.find((f) => f.id === targetId)
      if (tf) out(`file-${targetId}`, tf.path, 'file', 'importa')
    }
    // Entrantes: otros archivos del mismo módulo que importan a este
    for (const other of files) {
      if (other.id === fileId) continue
      if ((other.imports || []).includes(fileId)) {
        inc(`file-${other.id}`, other.path, 'file', 'lo importa')
      }
    }
    // Las pantallas que apuntan a este archivo se muestran en el panel
    // CanvasModuleDeps de la esquina superior derecha, no aquí, para
    // evitar duplicación con clicks que no llevan a ningún sitio.
  } else if (kind === 'flow') {
    (m.modules || []).forEach((mid) => {
      const back = model.modules.backend.find((x) => x.id === mid)
      const front = model.modules.frontend.find((x) => x.id === mid)
      const found = back || front
      if (found) out(`mod-${mid}`, found.name, back ? 'backend' : 'frontend', 'usa módulo')
    })
    ;(m.screens || []).forEach((s) => {
      const scr = model.screens.find((x) => x.id === s)
      if (scr) out(`scr-${s}`, scr.name, 'screen', 'pasa por')
    })
    ;(m.database || []).forEach((t) => {
      const tab = model.database.find((x) => x.id === t)
      if (tab) out(`db-${t}`, tab.name, 'database', 'toca tabla')
    })
  }

  result.total = result.incoming.length + result.outgoing.length
  return result
}
