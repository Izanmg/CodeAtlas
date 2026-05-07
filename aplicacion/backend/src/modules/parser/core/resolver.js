/**
 * resolver.js
 *
 * Validates that every cross-file reference (an ID pointing to another
 * element) actually exists in the assembled model.
 *
 * Behaviour: it does NOT modify the model and does NOT throw. Broken
 * references only emit `console.warn` messages. The diagram can still
 * render with broken references, and the user is informed of the gaps
 * so they can fix the documentation.
 *
 * IDs in the model stay as strings on purpose. The frontend can resolve
 * them to objects when it needs to (cross-referencing by ID is cheap),
 * and we avoid duplication and circular references in the JSON.
 */

/**
 * Walks the model and warns about any reference that points to a
 * non-existent ID.
 *
 * @param {object} model - The unified JSON model
 * @returns {object} The same model, unchanged
 */
export function resolveReferences(model) {
  const index = buildIndex(model)

  checkModules(model, index)
  checkScreens(model, index)
  checkFlows(model, index)
  checkDatabase(model, index)

  return model
}

/**
 * Builds a quick lookup of the IDs declared in each section of the model.
 * Sets give O(1) `has()` checks during validation.
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

/** Standard warning format for broken references. */
function warn(context, id, collection) {
  console.warn(
    `[resolver] Warning: ${context} references "${id}" which does not exist in ${collection}`
  )
}

function checkModules(model, index) {
  for (const m of model.modules.backend) {
    for (const id of m.database) {
      if (!index.database.has(id)) warn(`backend module "${m.id}" (database)`, id, 'database')
    }
    for (const id of m.dependsOn) {
      if (!index.modules.has(id)) warn(`backend module "${m.id}" (depends-on)`, id, 'modules')
    }
  }

  for (const m of model.modules.frontend) {
    for (const id of m.screens) {
      if (!index.screens.has(id)) warn(`frontend module "${m.id}" (screens)`, id, 'screens')
    }
    for (const id of m.consumesApi) {
      if (!index.modules.has(id)) warn(`frontend module "${m.id}" (consumes-api)`, id, 'modules')
    }
    for (const id of m.dependsOn) {
      if (!index.modules.has(id)) warn(`frontend module "${m.id}" (depends-on)`, id, 'modules')
    }
  }
}

function checkScreens(model, index) {
  for (const s of model.screens) {
    if (!index.modules.has(s.module)) {
      warn(`screen "${s.id}" (module)`, s.module, 'modules')
    }
    for (const id of s.navigatesTo) {
      if (!index.screens.has(id)) warn(`screen "${s.id}" (navigates-to)`, id, 'screens')
    }
  }
}

function checkFlows(model, index) {
  for (const f of model.flows) {
    for (const id of f.screens) {
      if (!index.screens.has(id)) warn(`flow "${f.id}" (screens)`, id, 'screens')
    }
    // f.modules can be a list of strings OR a list of objects { id, file, functions }
    for (const mod of f.modules) {
      const id = typeof mod === 'string' ? mod : mod.id
      if (!index.modules.has(id)) warn(`flow "${f.id}" (modules)`, id, 'modules')
    }
    for (const id of f.database) {
      if (!index.database.has(id)) warn(`flow "${f.id}" (database)`, id, 'database')
    }
  }
}

function checkDatabase(model, index) {
  for (const e of model.database) {
    for (const id of e.usedBy) {
      if (!index.modules.has(id)) warn(`entity "${e.id}" (used-by)`, id, 'modules')
    }
    for (const rel of e.relations) {
      if (!index.database.has(rel.target)) {
        warn(`entity "${e.id}" (relations)`, rel.target, 'database')
      }
    }
  }
}
