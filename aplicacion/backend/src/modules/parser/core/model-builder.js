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
    systemRules: {}
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
      // El archivo índice no aporta nada al modelo. Solo existe para que el
      // validator pueda confirmar que el proyecto declara sus file-types.
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
    steps: parseList(knownSections['steps'] ?? ''),
    errorCases: parseList(knownSections['error cases'] ?? ''),
    notes: knownSections['notes'] ?? null,
    extensions
  }
}

function buildEntity(yaml, knownSections, extensions) {
  return {
    id: yaml.id,
    name: yaml.name,
    description: yaml.description,
    usedBy: yaml['used-by'] ?? [],
    relations: yaml.relations ?? [],
    table: knownSections['table'] ?? null,
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
