/**
 * validator.js
 *
 * Validates the parsed YAML frontmatter of each file against the schema
 * defined in frontmatter.config.js.
 *
 * Throws a precise error (with filename and line number) on the first
 * problem it finds. The service does not catch validation errors — they
 * propagate up to the controller, which surfaces them as 400 Bad Request.
 *
 * Errors always start with `[filename]` so the controller can recognize
 * them and distinguish them from internal errors (which become 500).
 */

import { FRONTMATTER_SCHEMA, VALID_TYPES, VALID_LAYERS } from './frontmatter.config.js'

/**
 * Validates a parsed frontmatter object against the schema for its type.
 *
 * @param {object} yamlObject - The parsed YAML object
 * @param {string} rawYaml - The original YAML string (used to compute line numbers)
 * @param {string} filename - The .md file name (used in error messages)
 * @throws {Error} Detailed message if any required field is missing or has the wrong type
 */
export function validateFrontmatter(yamlObject, rawYaml, filename) {
  // 1. `type` must always exist and be one of the recognized values
  if (!yamlObject.type) {
    throw new Error(`[${filename}] missing required field "type" in frontmatter`)
  }
  if (!VALID_TYPES.includes(yamlObject.type)) {
    const line = getFieldLine(rawYaml, 'type')
    throw new Error(
      `[${filename}:${line}] unknown type "${yamlObject.type}". Valid types: ${VALID_TYPES.join(', ')}`
    )
  }

  const schema = FRONTMATTER_SCHEMA[yamlObject.type]

  // 2. For modules, validate `layer` first because the next step depends on it
  if (yamlObject.type === 'module') {
    if (!yamlObject.layer) {
      throw new Error(`[${filename}] missing required field "layer" in frontmatter`)
    }
    if (!VALID_LAYERS.includes(yamlObject.layer)) {
      const line = getFieldLine(rawYaml, 'layer')
      throw new Error(
        `[${filename}:${line}] invalid value "${yamlObject.layer}" for field "layer". Must be "backend" or "frontend"`
      )
    }
  }

  // 3. Build the effective list of required fields for this file
  let requiredFields = [...schema.required]
  if (yamlObject.type === 'module' && schema.requiredByLayer) {
    requiredFields = requiredFields.concat(schema.requiredByLayer[yamlObject.layer] ?? [])
  }

  // 4. Check that every required field is present and not null
  for (const field of requiredFields) {
    if (yamlObject[field] === undefined || yamlObject[field] === null) {
      throw new Error(`[${filename}] missing required field "${field}" in frontmatter`)
    }
  }

  // 5. Check that present fields have the expected type
  for (const [field, value] of Object.entries(yamlObject)) {
    const expectedType = schema.types[field]
    if (!expectedType) continue   // unknown fields are tolerated, not validated

    const actualType = Array.isArray(value) ? 'array' : typeof value
    if (actualType !== expectedType) {
      const line = getFieldLine(rawYaml, field)
      throw new Error(
        `[${filename}:${line}] field "${field}" must be ${expectedType}, got ${actualType}`
      )
    }
  }
}

/**
 * Locates the line number where `fieldName:` appears in the raw YAML.
 * Used to make error messages point at the offending line.
 *
 * @returns {number|string} 1-based line number, or '?' if not found
 */
function getFieldLine(rawYaml, fieldName) {
  const lines = rawYaml.split('\n')
  const index = lines.findIndex(line => line.trimStart().startsWith(fieldName + ':'))
  return index === -1 ? '?' : index + 1
}
