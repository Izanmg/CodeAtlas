/**
 * yaml-parser.js
 *
 * Convierte un string YAML en un objeto JS plano.
 * Es un wrapper fino sobre js-yaml que añade un manejo de errores estructurado.
 *
 * Responsabilidad: solo conversión de formato (YAML → objeto JS).
 * NO valida la presencia de campos, ni los tipos, ni reglas de negocio — eso es validator.js.
 * NO convierte los nombres de campo a camelCase — eso es model-builder.js.
 */

import yaml from 'js-yaml'

/**
 * Parsea un string YAML y devuelve el objeto JS resultante.
 *
 * @param {string} yamlString - Contenido YAML extraído del frontmatter de un .md
 * @returns {object|null} Objeto JS parseado, o null si la entrada está vacía
 * @throws {Error} Si el YAML tiene errores de sintaxis. El mensaje incluye un
 *   bloque de código con números de línea y una flecha apuntando a la línea
 *   problemática.
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
 * Construye un mensaje de error con el fragmento de YAML completo, números
 * de línea y una flecha apuntando a la línea exacta donde js-yaml detectó
 * el problema. El formato está inspirado en compiladores como TypeScript
 * o Babel — fácil de leer de un vistazo.
 */
function formatYamlError(error, yamlString) {
  if (!error.mark) {
    return `Error de sintaxis YAML: ${error.message}`
  }

  const errorLine = error.mark.line     // base 0
  const errorCol = error.mark.column    // base 0
  const lines = yamlString.split('\n')

  const frame = lines.map((line, i) => {
    const lineNumber = String(i + 1).padStart(3, ' ')
    const marker = i === errorLine ? ` ← ${error.reason}` : ''
    return `${lineNumber} | ${line}${marker}`
  }).join('\n')

  return `Error de sintaxis YAML en línea ${errorLine + 1}, columna ${errorCol + 1}:\n\n${frame}`
}
