/**
 * resolver.js
 *
 * Valida que cada referencia entre archivos (un ID que apunta a otro
 * elemento) exista realmente en el modelo ya ensamblado.
 *
 * Comportamiento: NO modifica el modelo y NO lanza errores. Las referencias
 * rotas solo emiten mensajes con `console.warn`. El diagrama puede pintarse
 * igualmente con referencias rotas, y el usuario queda informado de los
 * huecos para que pueda corregir su documentación.
 *
 * Los IDs en el modelo se mantienen como strings a propósito. El frontend
 * puede resolverlos a objetos cuando lo necesite (cruzar por ID es barato),
 * y así evitamos duplicación y referencias circulares en el JSON.
 */

/**
 * Recorre el modelo y avisa de cada referencia que apunte a un ID inexistente.
 *
 * @param {object} model - El modelo JSON unificado
 * @returns {object} El mismo modelo, sin modificar
 */
export function resolveReferences(model) {
  const index = buildIndex(model)

  checkModules(model, index)
  checkScreens(model, index)
  checkFlows(model, index)
  checkDatabase(model, index)
  checkFileImports(model)

  return model
}

/**
 * Para cada módulo, comprueba que `file.imports` solo apunte a IDs de
 * archivos definidos en el mismo módulo. Las dependencias entre módulos
 * deben declararse en `module.depends-on`, no en imports a nivel de archivo.
 */
function checkFileImports(model) {
  const allModules = [...model.modules.backend, ...model.modules.frontend]
  for (const m of allModules) {
    const localFileIds = new Set((m.files ?? []).map((f) => f.id))
    for (const f of (m.files ?? [])) {
      for (const target of (f.imports ?? [])) {
        if (!localFileIds.has(target)) {
          warn(
            `archivo "${f.id}" del módulo "${m.id}" (imports)`,
            target,
            'files del mismo módulo'
          )
        }
      }
    }
  }
}

/**
 * Construye un índice rápido de los IDs declarados en cada sección del modelo.
 * Los Sets dan comprobaciones `has()` en O(1) durante la validación.
 */
function buildIndex(model) {
  return {
    modules: new Set([
      ...model.modules.backend.map(m => m.id),
      ...model.modules.frontend.map(m => m.id)
    ]),
    screens: new Set(model.screens.map(s => s.id)),
    flows: new Set(model.flows.map(f => f.id)),
    database: new Set(model.database.map(e => e.id))
  }
}

/** Formato estándar de los warnings por referencias rotas. */
function warn(context, id, collection) {
  console.warn(
    `[resolver] Aviso: ${context} referencia "${id}" que no existe en ${collection}`
  )
}

function checkModules(model, index) {
  for (const m of model.modules.backend) {
    for (const id of m.database) {
      if (!index.database.has(id)) warn(`módulo backend "${m.id}" (database)`, id, 'database')
    }
    for (const id of m.dependsOn) {
      if (!index.modules.has(id)) warn(`módulo backend "${m.id}" (depends-on)`, id, 'modules')
    }
  }

  for (const m of model.modules.frontend) {
    for (const id of m.screens) {
      if (!index.screens.has(id)) warn(`módulo frontend "${m.id}" (screens)`, id, 'screens')
    }
    for (const id of m.consumesApi) {
      if (!index.modules.has(id)) warn(`módulo frontend "${m.id}" (consumes-api)`, id, 'modules')
    }
    for (const id of m.dependsOn) {
      if (!index.modules.has(id)) warn(`módulo frontend "${m.id}" (depends-on)`, id, 'modules')
    }
  }
}

function checkScreens(model, index) {
  for (const s of model.screens) {
    if (!index.modules.has(s.module)) {
      warn(`pantalla "${s.id}" (module)`, s.module, 'modules')
    }
    for (const id of s.navigatesTo) {
      if (!index.screens.has(id)) warn(`pantalla "${s.id}" (navigates-to)`, id, 'screens')
    }
  }
}

function checkFlows(model, index) {
  for (const f of model.flows) {
    for (const id of f.screens) {
      if (!index.screens.has(id)) warn(`flujo "${f.id}" (screens)`, id, 'screens')
    }
    // f.modules puede ser una lista de strings O una lista de objetos { id, file, functions }
    for (const mod of f.modules) {
      const id = typeof mod === 'string' ? mod : mod.id
      if (!index.modules.has(id)) warn(`flujo "${f.id}" (modules)`, id, 'modules')
    }
    for (const id of f.database) {
      if (!index.database.has(id)) warn(`flujo "${f.id}" (database)`, id, 'database')
    }
  }
}

function checkDatabase(model, index) {
  for (const e of model.database) {
    for (const id of e.usedBy) {
      if (!index.modules.has(id)) warn(`entidad "${e.id}" (used-by)`, id, 'modules')
    }
    for (const rel of e.relations) {
      if (!index.database.has(rel.target)) {
        warn(`entidad "${e.id}" (relations)`, rel.target, 'database')
      }
    }
  }
}
