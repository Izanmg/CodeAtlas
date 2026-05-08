/**
 * model-builder.js
 *
 * Ensambla el modelo JSON unificado a partir del array de archivos parseados.
 *
 * Responsabilidad: transformación de datos. Toma la salida cruda de los parsers
 * de YAML y Markdown, convierte los campos de kebab-case a camelCase, parsea
 * las secciones de tipo lista a arrays JS y agrupa cada archivo en el slot
 * correspondiente del modelo.
 *
 * NO valida (eso es validator.js).
 * NO extrae contenido (eso es markdown-source.js).
 * NO resuelve referencias entre archivos (eso es resolver.js).
 */

import { EXPECTED_SECTIONS } from './sections.config.js'

/**
 * Construye el modelo JSON unificado a partir de la lista de archivos parseados.
 *
 * @param {Array<{yaml: object, sections: object}>} parsedFiles
 * @returns {object} El modelo JSON unificado
 */
export function buildModel(parsedFiles) {
  const model = {
    modules: { backend: [], frontend: [] },
    screens: [],
    flows: [],
    database: [],
    systemRules: {},
    overview: null,
    fileTypes: {}
  }

  for (const { yaml, sections } of parsedFiles) {
    const { knownSections, extensions } = splitSections(yaml.type, sections)
    dispatch(model, yaml, knownSections, extensions)
  }

  return model
}

/**
 * Encamina cada archivo a su función constructora según `yaml.type` y mete
 * el resultado en el slot correcto del modelo.
 */
function dispatch(model, yaml, knownSections, extensions) {
  switch (yaml.type) {
    case 'modules-index':
      // Conservamos el Overview y el vocabulario de file-types para que el
      // frontend pueda renderizarlos. Si hay varios índices, solo el primero
      // gana (no debería haber más de uno por proyecto).
      if (!model.overview) {
        model.overview = knownSections['overview'] ?? null
        model.fileTypes = yaml['file-types'] ?? {}
      }
      break

    case 'module': {
      const built = buildModule(yaml, knownSections, extensions)
      model.modules[yaml.layer].push(built)
      break
    }

    case 'screen':
      model.screens.push(buildScreen(yaml, knownSections, extensions))
      break

    case 'flow':
      model.flows.push(buildFlow(yaml, knownSections, extensions))
      break

    case 'entity':
      model.database.push(buildEntity(yaml, knownSections, extensions))
      break

    case 'system-rules':
      model.systemRules = buildSystemRules(yaml, knownSections, extensions)
      break

    default:
      // El validator debería haber rechazado los tipos desconocidos antes,
      // pero logueamos por si en el futuro cambia esa lógica.
      console.warn(`[model-builder] Tipo desconocido "${yaml.type}", se ignora`)
  }
}

/**
 * Separa un objeto de secciones en los dos grupos que usa el modelo:
 *   - knownSections: declaradas en sections.config.js para este tipo
 *   - extensions:    todo lo demás, conservado tal cual para el diagrama
 */
function splitSections(type, sections) {
  const expected = EXPECTED_SECTIONS[type] ?? []
  const knownSections = {}
  const extensions = {}

  for (const [key, value] of Object.entries(sections)) {
    if (expected.includes(key)) {
      knownSections[key] = value
    } else {
      extensions[key] = value
    }
  }

  return { knownSections, extensions }
}

// ---------- Constructores ----------

function buildModule(yaml, knownSections, extensions) {
  const base = {
    id: yaml.id,
    name: yaml.name,
    description: yaml.description,
    layer: yaml.layer,
    folders: yaml.folders ?? [],
    files: yaml.files ?? [],
    dependsOn: yaml['depends-on'] ?? [],
    functions: parseFunctions(knownSections['functions'] ?? ''),
    purpose: knownSections['purpose'] ?? null,
    notes: knownSections['notes'] ?? null,
    extensions
  }

  if (yaml.layer === 'backend') {
    return {
      ...base,
      api: yaml.api ?? [],
      database: yaml.database ?? []
    }
  }

  // frontend
  return {
    ...base,
    screens: yaml.screens ?? [],
    consumesApi: yaml['consumes-api'] ?? [],
    state: parseList(knownSections['state'] ?? '')
  }
}

function buildScreen(yaml, knownSections, extensions) {
  return {
    id: yaml.id,
    name: yaml.name,
    description: yaml.description,
    module: yaml.module,
    folder: yaml.folder ?? null,
    file: yaml.file ?? null,
    requiresAuth: yaml['requires-auth'],
    routes: yaml.routes ?? [],
    navigatesTo: yaml['navigates-to'] ?? [],
    components: yaml.components ?? [],
    fullDescription: knownSections['description'] ?? null,
    elements: parseList(knownSections['elements'] ?? ''),
    actions: parseList(knownSections['actions'] ?? ''),
    states: parseList(knownSections['states'] ?? ''),
    extensions
  }
}

function buildFlow(yaml, knownSections, extensions) {
  return {
    id: yaml.id,
    name: yaml.name,
    description: yaml.description,
    trigger: yaml.trigger,
    screens: yaml.screens ?? [],
    modules: yaml.modules ?? [],
    database: yaml.database ?? [],
    steps: parseFlowSteps(knownSections['steps'] ?? ''),
    errorCases: parseList(knownSections['error cases'] ?? ''),
    notes: knownSections['notes'] ?? null,
    extensions
  }
}

function buildEntity(yaml, knownSections, extensions) {
  const tableText = knownSections['table'] ?? null
  // Mezcla relaciones declaradas en YAML con las que se infieren de los
  // Ref: del bloque DBML; deduplica por target para no generar edges
  // duplicados cuando el usuario las declara en ambos sitios.
  const dbmlRelations = parseDbmlRelations(tableText)
  const yamlRelations = yaml.relations ?? []
  const seen = new Set()
  const relations = []
  for (const r of [...yamlRelations, ...dbmlRelations]) {
    if (!r?.target || seen.has(r.target)) continue
    seen.add(r.target)
    relations.push(r)
  }
  return {
    id: yaml.id,
    name: yaml.name,
    description: yaml.description,
    usedBy: yaml['used-by'] ?? [],
    relations,
    table: tableText,
    fields: parseDbmlFields(tableText),
    notes: knownSections['notes'] ?? null,
    extensions
  }
}

function buildSystemRules(yaml, knownSections, extensions) {
  return {
    auth: parseList(knownSections['auth'] ?? ''),
    navigation: parseList(knownSections['navigation'] ?? ''),
    validation: parseList(knownSections['validation'] ?? ''),
    conventions: parseList(knownSections['conventions'] ?? ''),
    technicalDecisions: parseList(knownSections['technical decisions'] ?? ''),
    extensions
  }
}

// ---------- Funciones auxiliares ----------

/**
 * Convierte un bloque de lista Markdown ("- item" o "1. item") en un array
 * de strings recortados. Las líneas vacías se descartan.
 */
function parseList(text) {
  if (!text) return []

  return text
    .split('\n')
    .map(line => line.replace(/^(\s*[-*]|\s*\d+\.)\s+/, '').trim())
    .filter(line => line.length > 0)
}

/**
 * Convierte la sección `## Steps` de un flujo en un array de StepObject.
 *
 * Cada paso es una línea de lista (- ... o 1. ...). Opcionalmente puede llevar
 * un prefijo de referencia `[capa:moduleId/archivo/función]` que indica a qué
 * nodo del diagrama pertenece. El parser extrae el prefijo, calcula el nodeId
 * de Vue Flow asociado y devuelve un StepObject por paso.
 *
 * Formato:
 *   - [screen:login] El usuario rellena el formulario
 *   - [backend:auth-backend/auth.service.ts/validateToken] Se valida el token
 *
 * Niveles de granularidad opcionales (de izquierda a derecha):
 *   - [backend:auth-backend]                                  → solo módulo
 *   - [backend:auth-backend/auth.service.ts]                  → módulo + archivo
 *   - [backend:auth-backend/auth.service.ts/validateToken]    → todo
 *
 * Pasos sin prefijo siguen siendo válidos: layer y nodeId quedan en null.
 */
function parseFlowSteps(text) {
  if (!text) return []

  const REF_PATTERN = /^\[(screen|frontend|backend|database):([^\]]+)\]\s*(.*)$/

  return text
    .split('\n')
    .map(line => line.replace(/^(\s*[-*]|\s*\d+\.)\s+/, '').trim())
    .filter(line => line.length > 0)
    .map((line, index) => {
      const match = line.match(REF_PATTERN)
      if (!match) {
        return {
          index,
          label: line,
          layer: null,
          moduleId: null,
          file: null,
          fn: null,
          nodeId: null,
        }
      }

      const [, layer, ref, label] = match
      const parts = ref.split('/').map(p => p.trim()).filter(Boolean)
      const moduleId = parts[0] ?? null
      const file = layer === 'screen' || layer === 'database' ? null : (parts[1] ?? null)
      const fn = layer === 'backend' ? (parts[2] ?? null) : null

      return {
        index,
        label: label.trim(),
        layer,
        moduleId,
        file,
        fn,
        nodeId: computeNodeId(layer, moduleId),
      }
    })
}

/**
 * Convierte (capa, moduleId) en el ID de Vue Flow correspondiente.
 * Mantiene la convención de auto-layout.js del frontend.
 *
 * Para `database` se admite una lista separada por comas; se usa el primer ID
 * para calcular el nodeId (la lista completa puede consultarse en moduleId).
 */
function computeNodeId(layer, moduleId) {
  if (!moduleId) return null
  switch (layer) {
    case 'screen':   return `scr-${moduleId}`
    case 'frontend': return `mod-${moduleId}`
    case 'backend':  return `mod-${moduleId}`
    case 'database': {
      const first = moduleId.split(',')[0].trim()
      return first ? `db-${first}` : null
    }
    default: return null
  }
}

/**
 * Extrae los campos de un bloque DBML (``` dbml Table X { ... } ```) y
 * devuelve un array de { name, type, pk, fk, unique }.
 * Detecta FK tanto por atributo inline `ref:` como por líneas `Ref:` separadas.
 * Devuelve [] si el texto es nulo o no contiene ninguna tabla DBML.
 */
function parseDbmlFields(tableText) {
  if (!tableText) return []

  const content = tableText.replace(/```\w*\n?/g, '')
  const tableMatch = content.match(/Table\s+(\w+)\s*\{([^}]+)\}/)
  if (!tableMatch) return []

  const tableName = tableMatch[1]
  const bodyText = tableMatch[2]

  // Detecta FKs desde líneas `Ref:`: solo el lado "muchos" (el que apunta a otra tabla)
  // Ref: A.campo > B.campo → A.campo es FK;  Ref: A.campo < B.campo → B.campo es FK
  const prefix = tableName + '.'
  const fkFields = new Set()
  for (const line of content.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed.startsWith('Ref:')) continue
    const m = trimmed.slice(4).trim().match(/^(\S+)\s*([><-]|<>)\s*(\S+)/)
    if (!m) continue
    const [, left, op, right] = m
    if (op === '>') {
      if (left.startsWith(prefix)) fkFields.add(left.slice(prefix.length))
    } else if (op === '<') {
      if (right.startsWith(prefix)) fkFields.add(right.slice(prefix.length))
    } else if (op === '-') {
      // one-to-one: marca el campo que no es 'id' (la FK, no la PK)
      if (left.startsWith(prefix)) { const f = left.slice(prefix.length); if (f !== 'id') fkFields.add(f) }
      if (right.startsWith(prefix)) { const f = right.slice(prefix.length); if (f !== 'id') fkFields.add(f) }
    }
  }

  const fields = []
  for (const line of bodyText.split('\n')) {
    const m = line.trim().match(/^(\w+)\s+(\w+)(?:\s+\[([^\]]*)\])?/)
    if (!m) continue
    const [, name, type, mods = ''] = m
    const modsLower = mods.toLowerCase()
    fields.push({
      name,
      type,
      pk: modsLower.includes('pk'),
      fk: modsLower.includes('ref:') || fkFields.has(name),
      unique: modsLower.includes('unique'),
    })
  }
  return fields
}

/**
 * Extrae las relaciones FK de un bloque DBML mirando las líneas `Ref:`.
 * Devuelve un array de { target, type, sourceField, targetField } desde la
 * perspectiva de la tabla del bloque.
 *
 * Convención DBML:
 *   Ref: A.x > B.y   → A apunta a B (A es el lado "muchos")
 *   Ref: A.x < B.y   → B apunta a A
 *   Ref: A.x - B.y   → uno-a-uno (asignamos source = lado no-id)
 *
 * Asume que el nombre de la tabla en DBML coincide con el id de la entidad
 * en YAML (la convención del proyecto).
 */
function parseDbmlRelations(tableText) {
  if (!tableText) return []
  const content = tableText.replace(/```\w*\n?/g, '')
  const tableMatch = content.match(/Table\s+(\w+)\s*\{[^}]+\}/)
  if (!tableMatch) return []
  const thisTable = tableMatch[1]

  const relations = []
  for (const line of content.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed.startsWith('Ref:')) continue
    const m = trimmed.slice(4).trim().match(/^(\S+)\s*([><-]|<>)\s*(\S+)/)
    if (!m) continue
    const [, left, op, right] = m
    const [leftTable, leftField]  = left.split('.')
    const [rightTable, rightField] = right.split('.')

    if (leftTable === thisTable) {
      relations.push({
        target: rightTable,
        type: op === '>' ? 'many-to-one' : op === '<' ? 'one-to-many' : 'one-to-one',
        sourceField: leftField,
        targetField: rightField,
      })
    } else if (rightTable === thisTable) {
      relations.push({
        target: leftTable,
        type: op === '<' ? 'many-to-one' : op === '>' ? 'one-to-many' : 'one-to-one',
        sourceField: rightField,
        targetField: leftField,
      })
    }
  }
  return relations
}

/**
 * Convierte la sección `## Functions` en un objeto donde cada clave es el
 * id de un archivo. Si hay subsecciones `### subsección`, cada una se
 * convierte en una clave. Si no las hay, todo va bajo la clave `_` como
 * lista plana.
 */
function parseFunctions(text) {
  if (!text) return {}

  const result = {}
  let currentKey = '_'

  for (const line of text.split('\n')) {
    const subsection = line.match(/^###\s+(.+)/)
    if (subsection) {
      currentKey = subsection[1].trim()
      result[currentKey] = []
      continue
    }

    const fn = line.replace(/^[-*]\s+/, '').trim()
    if (fn && fn !== line) {       // la línea tenía marcador de lista
      if (!result[currentKey]) result[currentKey] = []
      result[currentKey].push(fn)
    }
  }

  return result
}
