/**
 * yaml-parser.js
 *
 * Converts a raw YAML string into a plain JS object.
 * This is a thin wrapper around js-yaml that adds structured error reporting.
 *
 * Responsibility: format conversion only (YAML → JS object).
 * Does NOT validate field presence, types, or business rules — that is validator.js.
 * Does NOT transform field names to camelCase — that is model-builder.js.
 */

import yaml from 'js-yaml'

/**
 * Parses a YAML string and returns the resulting JS object.
 *
 * @param {string} yamlString - Raw YAML content extracted from a .md frontmatter block
 * @returns {object|null} Parsed JS object, or null if the input is empty
 * @throws {Error} If the YAML has syntax errors — the message includes a code frame
 *   with line numbers and an arrow pointing at the problematic line
 */
export function parseYaml(yamlString) {
  if (!yamlString || !yamlString.trim()) return null

  try {
    return yaml.load(yamlString)
  } catch (error) {
    throw new Error(formatYamlError(error, yamlString))
  }
}

/**
 * Builds a code frame error message with line numbers and an arrow at the
 * exact line where js-yaml detected the problem. Format inspired by
 * compilers like TypeScript and Babel — easy to scan at a glance.
 */
function formatYamlError(error, yamlString) {
  if (!error.mark) {
    return `YAML syntax error: ${error.message}`
  }

  const errorLine = error.mark.line     // 0-based
  const errorCol = error.mark.column    // 0-based
  const lines = yamlString.split('\n')

  const frame = lines.map((line, i) => {
    const lineNumber = String(i + 1).padStart(3, ' ')
    const marker = i === errorLine ? ` ← ${error.reason}` : ''
    return `${lineNumber} | ${line}${marker}`
  }).join('\n')

  return `YAML syntax error at line ${errorLine + 1}, column ${errorCol + 1}:\n\n${frame}`
}
