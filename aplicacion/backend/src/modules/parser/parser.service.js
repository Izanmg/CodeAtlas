/**
 * parser.service.js
 *
 * Orquesta el pipeline completo de parseo. Único punto de entrada al módulo
 * para el controller. Este archivo no tiene lógica de negocio propia — solo
 * llama a las demás piezas en el orden correcto.
 *
 * Pipeline:
 *   1. sortFiles            — reordena para procesar primero los referenciados
 *   2. extractFromMarkdown  — extrae YAML y secciones de cada archivo
 *   3. validateAndParse     — parsea el YAML y valida el frontmatter (lanza si falla)
 *   4. buildModel           — ensambla el modelo JSON unificado
 *   5. resolveReferences    — avisa de referencias cruzadas rotas
 *   6. calculateLayout      — calcula coordenadas por defecto de cada nodo
 *   7. saveModel            — persiste { model, layout }
 */

import { extractFromMarkdown } from './sources/markdown-source.js'
import { parseYaml }           from './core/yaml-parser.js'
import { validateFrontmatter } from './core/validator.js'
import { buildModel }          from './core/model-builder.js'
import { resolveReferences }   from './core/resolver.js'
import { calculateLayout }     from './core/layout-calculator.js'
import { saveModel }           from './parser.repository.js'

/**
 * Ejecuta el pipeline completo de parseo sobre los archivos subidos.
 *
 * @param {Array<{filename: string, content: string}>} files
 * @returns {Promise<object>} El modelo JSON unificado
 * @throws {Error} Si algún archivo falla la validación del frontmatter. El
 *   mensaje empieza por `[nombre-archivo]` para que el controller lo mapee
 *   a una respuesta 400.
 */
export async function parseDocumentation(files) {
  const sorted    = sortFiles(files)
  const extracted = extractFromMarkdown(sorted)
  const parsed    = validateAndParse(extracted, sorted)
  const model     = buildModel(parsed)
  const resolved  = resolveReferences(model)
  const layout    = calculateLayout(resolved)

  await saveModel({ model: resolved, layout })
  return { model: resolved, layout }
}

/**
 * Ordena los archivos para que los "anteriores" en la cadena de dependencias
 * se procesen antes que los "posteriores". Módulos antes que pantallas,
 * pantallas antes que flujos, etc. Los archivos que no encajan en ningún
 * bucket se añaden al final en su orden original.
 */
function sortFiles(files) {
  const ORDER = [
    f => f.filename.includes('01-modules'),
    f => f.filename.includes('modules/backend/') || f.filename.includes('modules/frontend/'),
    f => f.filename.includes('database/'),
    f => f.filename.includes('screens/'),
    f => f.filename.includes('flows/'),
    f => f.filename.includes('05-system-rules')
  ]

  const buckets = ORDER.map(() => [])
  const rest = []

  for (const file of files) {
    const bucketIndex = ORDER.findIndex(match => match(file))
    if (bucketIndex !== -1) {
      buckets[bucketIndex].push(file)
    } else {
      rest.push(file)
    }
  }

  return [...buckets.flat(), ...rest]
}

/**
 * Parsea el YAML de cada archivo extraído y valida su frontmatter.
 * Los archivos sin frontmatter YAML se descartan en silencio.
 * Si la validación falla, el error se propaga al controller.
 */
function validateAndParse(extracted, sortedFiles) {
  return extracted
    .map((item, i) => {
      const yaml = parseYaml(item.yaml)
      if (!yaml) return null

      // Lanza si el schema no se cumple — se captura en el controller
      validateFrontmatter(yaml, item.yaml, sortedFiles[i].filename)

      return { yaml, sections: item.sections }
    })
    .filter(Boolean)
}
