/**
 * model-builder.js
 *
 * Assembles the unified JSON model from the array of parsed files.
 *
 * Responsibility: data transformation. Takes the raw output of the YAML and
 * Markdown parsers, converts kebab-case fields to camelCase, parses list
 * sections into JS arrays, and groups each file into the correct slot of
 * the unified model.
 *
 * Does NOT validate (validator.js).
 * Does NOT extract content (markdown-source.js).
 * Does NOT resolve cross-file references (resolver.js).
 */

import { EXPECTED_SECTIONS } from './sections.config.js'

/**
 * Builds the unified JSON model from a list of parsed files.
 *
 * @param {Array<{yaml: object, sections: object}>} parsedFiles
 * @returns {object} The unified JSON model
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
 * Routes each file to its constructor function based on `yaml.type`,
 * and pushes the result into the correct slot of the model.
 */
function dispatch(model, yaml, knownSections, extensions) {
  switch (yaml.type) {
    case 'modules-index':
      // The index file contributes nothing to the model. It only exists
      // so the validator can confirm the project declares its file-types.
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
      // The validator should already have rejected unknown types, but
      // we log just in case it changes in the future.
      console.warn(`[model-builder] Unknown type "${yaml.type}", skipping`)
  }
}

/**
 * Splits a sections object into the two buckets the model uses:
 *   - knownSections: declared in sections.config.js for this type
 *   - extensions:    everything else, kept verbatim for the diagram
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

// ---------- Constructors ----------

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

// ---------- Helpers ----------

/**
 * Converts a Markdown list block ("- item" or "1. item") into an array of
 * trimmed strings. Empty lines are dropped.
 */
function parseList(text) {
  if (!text) return []

  return text
    .split('\n')
    .map(line => line.replace(/^(\s*[-*]|\s*\d+\.)\s+/, '').trim())
    .filter(line => line.length > 0)
}

/**
 * Converts the `## Functions` section into an object keyed by file id.
 * If `### subsection` headers are present, each becomes a key. Otherwise
 * everything goes under the `_` key as a flat list.
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
    if (fn && fn !== line) {       // line had a list marker
      if (!result[currentKey]) result[currentKey] = []
      result[currentKey].push(fn)
    }
  }

  return result
}
