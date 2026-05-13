/**
 * bot.validator.js
 *
 * Valida los archivos .md que devuelve el LLM antes de aceptarlos.
 * Comprobaciones:
 *   - Path seguro (sin traversal, dentro de app-doc/)
 *   - Frontmatter YAML parseable y delimitado por `---`
 *   - Presencia de los campos obligatorios según el `type`
 *
 * Si algún archivo falla, devolvemos los errores agregados para que el
 * service pueda reintentar pidiéndole al LLM que corrija.
 */

import { parseYaml } from '../parser/core/yaml-parser.js'

const REQUIRED_BY_TYPE = {
  'modules-index': ['type', 'backend', 'frontend', 'file-types'],
  'module':        ['type', 'layer', 'id', 'name', 'description', 'depends-on'],
  'entity':        ['type', 'id', 'name', 'description'],
  'screen':        ['type', 'id', 'name', 'description', 'module', 'requires-auth'],
  'flow':          ['type', 'id', 'name', 'description', 'trigger'],
  'system-rules':  ['type']
}

const FRONTMATTER_RE = /^---\n([\s\S]+?)\n---/

/**
 * Valida un único archivo devuelto por el LLM.
 *
 * @param {{path: string, content: string}} file
 * @returns {string[]} Lista de errores. Vacía si el archivo es válido.
 */
export function validateFile(file) {
  const errors = []

  if (!file.path || typeof file.path !== 'string') {
    errors.push('path ausente o inválido')
    return errors
  }

  // Path seguro: no absoluto, sin `..`, debe vivir bajo app-doc/.
  const normalized = file.path.replace(/\\/g, '/')
  if (normalized.includes('..') || normalized.startsWith('/') || /^[a-zA-Z]:/.test(normalized)) {
    errors.push(`[${file.path}] path inseguro (contiene .. o es absoluto)`)
  }
  if (!normalized.startsWith('app-doc/')) {
    errors.push(`[${file.path}] el path debe empezar por "app-doc/"`)
  }
  if (!normalized.endsWith('.md')) {
    errors.push(`[${file.path}] el archivo debe tener extensión .md`)
  }

  if (typeof file.content !== 'string' || file.content.trim() === '') {
    errors.push(`[${file.path}] content vacío`)
    return errors
  }

  // Frontmatter YAML obligatorio.
  const match = file.content.match(FRONTMATTER_RE)
  if (!match) {
    errors.push(`[${file.path}] falta el bloque de frontmatter delimitado por ---`)
    return errors
  }

  let yaml
  try {
    yaml = parseYaml(match[1])
  } catch (err) {
    errors.push(`[${file.path}] el frontmatter no es YAML válido: ${err.message}`)
    return errors
  }

  if (!yaml || !yaml.type) {
    errors.push(`[${file.path}] el frontmatter no tiene campo "type"`)
    return errors
  }

  const required = REQUIRED_BY_TYPE[yaml.type]
  if (!required) {
    errors.push(`[${file.path}] type "${yaml.type}" no reconocido`)
    return errors
  }

  for (const field of required) {
    if (!(field in yaml)) {
      errors.push(`[${file.path}] falta el campo obligatorio "${field}" (type=${yaml.type})`)
    }
  }

  return errors
}

/**
 * Valida un array de archivos devueltos por el LLM.
 *
 * @param {Array<{path: string, content: string}>} files
 * @returns {{ valid: boolean, errors: string[] }}
 */
export function validateFiles(files) {
  if (!Array.isArray(files)) {
    return { valid: false, errors: ['files debe ser un array'] }
  }
  const errors = files.flatMap(validateFile)
  return { valid: errors.length === 0, errors }
}
