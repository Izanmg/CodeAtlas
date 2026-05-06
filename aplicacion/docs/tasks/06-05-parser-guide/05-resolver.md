# 05 — core/resolver.js

## Qué hace
Recibe el modelo unificado y valida que todas las referencias entre IDs existen. No sustituye los IDs por objetos — los valores siguen siendo strings. Solo comprueba que apuntan a algo real y loguea warnings si algo no cuadra.

## Responsabilidad
Este archivo no modifica el modelo ni lanza errores — solo avisa. Si una referencia está rota es un problema de la documentación del usuario, no del sistema. El diagrama puede funcionar igualmente con referencias rotas; las advertencias ayudan al usuario a detectar inconsistencias.

---

## Firma

```js
// Recibe: el modelo JSON unificado
// Devuelve: el mismo modelo sin modificar
export function resolveReferences(model) {}
```

---

## Estructura mínima del archivo

```js
export function resolveReferences(model) {
  const index = buildIndex(model)

  checkModules(model, index)
  checkScreens(model, index)
  checkFlows(model, index)
  checkDatabase(model, index)

  return model
}

// Construye un índice de todos los IDs disponibles en el modelo
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

// Emite un warning estándar para referencias rotas
function warn(context, id, collection) {
  console.warn(`[resolver] Warning: ${context} references "${id}" which does not exist in ${collection}`)
}
```

---

## Funciones de validación por tipo

### `checkModules(model, index)`

```js
function checkModules(model, index) {
  for (const m of model.modules.backend) {
    for (const id of m.database) {
      if (!index.database.has(id))
        warn(`backend module "${m.id}" (database)`, id, 'database')
    }
    for (const id of m.dependsOn) {
      if (!index.modules.has(id))
        warn(`backend module "${m.id}" (depends-on)`, id, 'modules')
    }
  }

  for (const m of model.modules.frontend) {
    for (const id of m.screens) {
      if (!index.screens.has(id))
        warn(`frontend module "${m.id}" (screens)`, id, 'screens')
    }
    for (const id of m.consumesApi) {
      if (!index.modules.has(id))
        warn(`frontend module "${m.id}" (consumes-api)`, id, 'modules')
    }
    for (const id of m.dependsOn) {
      if (!index.modules.has(id))
        warn(`frontend module "${m.id}" (depends-on)`, id, 'modules')
    }
  }
}
```

### `checkScreens(model, index)`

```js
function checkScreens(model, index) {
  for (const s of model.screens) {
    if (!index.modules.has(s.module))
      warn(`screen "${s.id}" (module)`, s.module, 'modules')

    for (const id of s.navigatesTo) {
      if (!index.screens.has(id))
        warn(`screen "${s.id}" (navigates-to)`, id, 'screens')
    }
  }
}
```

### `checkFlows(model, index)`

```js
function checkFlows(model, index) {
  for (const f of model.flows) {
    for (const id of f.screens) {
      if (!index.screens.has(id))
        warn(`flow "${f.id}" (screens)`, id, 'screens')
    }
    for (const mod of f.modules) {
      const id = typeof mod === 'string' ? mod : mod.id
      if (!index.modules.has(id))
        warn(`flow "${f.id}" (modules)`, id, 'modules')
    }
    for (const id of f.database) {
      if (!index.database.has(id))
        warn(`flow "${f.id}" (database)`, id, 'database')
    }
  }
}
```

### `checkDatabase(model, index)`

```js
function checkDatabase(model, index) {
  for (const e of model.database) {
    for (const id of e.usedBy) {
      if (!index.modules.has(id))
        warn(`entity "${e.id}" (used-by)`, id, 'modules')
    }
    for (const rel of e.relations) {
      if (!index.database.has(rel.target))
        warn(`entity "${e.id}" (relations)`, rel.target, 'database')
    }
  }
}
```

---

## Ejemplo de warnings en consola

```
[resolver] Warning: screen "login" (module) references "auth-frontend" which does not exist in modules
[resolver] Warning: flow "user-login" (screens) references "dashboard" which does not exist in screens
[resolver] Warning: entity "projects" (relations) references "tags" which does not exist in database
```
