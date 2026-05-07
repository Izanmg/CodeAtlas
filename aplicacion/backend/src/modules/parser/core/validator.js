/**
 * validator.js
 *
 * Valida el frontmatter YAML ya parseado de cada archivo contra el schema
 * definido en frontmatter.config.js.
 *
 * Lanza un error preciso (con nombre de archivo y número de línea) en
 * cuanto encuentra el primer problema. El service no captura los errores
 * de validación — los deja subir hasta el controller, que los devuelve
 * como 400 Bad Request.
 *
 * Los errores siempre empiezan por `[nombre-archivo]` para que el
 * controller pueda distinguirlos de los errores internos (que se mapean
 * a 500).
 */

import { FRONTMATTER_SCHEMA, VALID_TYPES, VALID_LAYERS } from './frontmatter.config.js'

/**
 * Valida un objeto de frontmatter parseado contra el schema de su tipo.
 *
 * @param {object} yamlObject - El objeto YAML ya parseado
 * @param {string} rawYaml - El string YAML original (usado para calcular líneas)
 * @param {string} filename - Nombre del archivo .md (usado en los mensajes de error)
 * @throws {Error} Mensaje detallado si falta un campo requerido o tiene un tipo incorrecto
 */
export function validateFrontmatter(yamlObject, rawYaml, filename) {
  // 1. `type` siempre debe existir y ser uno de los valores reconocidos
  if (!yamlObject.type) {
    throw new Error(`[${filename}] falta el campo requerido "type" en el frontmatter`)
  }
  if (!VALID_TYPES.includes(yamlObject.type)) {
    const line = getFieldLine(rawYaml, 'type')
    throw new Error(
      `[${filename}:${line}] tipo desconocido "${yamlObject.type}". Tipos válidos: ${VALID_TYPES.join(', ')}`
    )
  }

  const schema = FRONTMATTER_SCHEMA[yamlObject.type]

  // 2. Para los módulos, validamos `layer` antes que el resto porque los
  //    campos requeridos siguientes dependen de su valor
  if (yamlObject.type === 'module') {
    if (!yamlObject.layer) {
      throw new Error(`[${filename}] falta el campo requerido "layer" en el frontmatter`)
    }
    if (!VALID_LAYERS.includes(yamlObject.layer)) {
      const line = getFieldLine(rawYaml, 'layer')
      throw new Error(
        `[${filename}:${line}] valor inválido "${yamlObject.layer}" para el campo "layer". Debe ser "backend" o "frontend"`
      )
    }
  }

  // 3. Construimos la lista efectiva de campos requeridos para este archivo
  let requiredFields = [...schema.required]
  if (yamlObject.type === 'module' && schema.requiredByLayer) {
    requiredFields = requiredFields.concat(schema.requiredByLayer[yamlObject.layer] ?? [])
  }

  // 4. Comprobamos que todos los campos requeridos están presentes y no son null
  for (const field of requiredFields) {
    if (yamlObject[field] === undefined || yamlObject[field] === null) {
      throw new Error(`[${filename}] falta el campo requerido "${field}" en el frontmatter`)
    }
  }

  // 5. Comprobamos que los campos presentes tienen el tipo esperado
  for (const [field, value] of Object.entries(yamlObject)) {
    const expectedType = schema.types[field]
    if (!expectedType) continue   // los campos desconocidos se toleran, no se validan

    const actualType = Array.isArray(value) ? 'array' : typeof value
    if (actualType !== expectedType) {
      const line = getFieldLine(rawYaml, field)
      throw new Error(
        `[${filename}:${line}] el campo "${field}" debe ser ${expectedType}, recibido ${actualType}`
      )
    }
  }
}

/**
 * Localiza el número de línea donde aparece `nombreCampo:` en el YAML original.
 * Sirve para que los mensajes de error apunten exactamente a la línea problemática.
 *
 * @returns {number|string} Número de línea (base 1), o '?' si no se encuentra
 */
function getFieldLine(rawYaml, fieldName) {
  const lines = rawYaml.split('\n')
  const index = lines.findIndex(line => line.trimStart().startsWith(fieldName + ':'))
  return index === -1 ? '?' : index + 1
}
