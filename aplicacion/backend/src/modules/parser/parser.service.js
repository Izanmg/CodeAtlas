/**
 * parser.service.js
 *
 * Orchestrates the full parsing pipeline. Single entry point for the
 * controller. This file holds no business logic of its own — it only
 * calls the other pieces in the right order.
 *
 * Pipeline:
 *   1. sortFiles         — reorder so referenced files are processed first
 *   2. extractFromMarkdown — extract YAML and sections from each file
 *   3. validateAndParse  — parse YAML and validate frontmatter (throws)
 *   4. buildModel        — assemble the unified JSON model
 *   5. resolveReferences — warn about broken cross-file references
 *   6. saveModel         — persist the result
 */

import { extractFromMarkdown } from './sources/markdown-source.js'
import { parseYaml }           from './core/yaml-parser.js'
import { validateFrontmatter } from './core/validator.js'
import { buildModel }          from './core/model-builder.js'
import { resolveReferences }   from './core/resolver.js'
import { saveModel }           from './parser.repository.js'

/**
 * Runs the full parsing pipeline on the uploaded files.
 *
 * @param {Array<{filename: string, content: string}>} files
 * @returns {Promise<object>} The unified JSON model
 * @throws {Error} If any file fails frontmatter validation. The message
 *   starts with `[filename]` so the controller can map it to a 400 response.
 */
export async function parseDocumentation(files) {
  const sorted    = sortFiles(files)
  const extracted = extractFromMarkdown(sorted)
  const parsed    = validateAndParse(extracted, sorted)
  const model     = buildModel(parsed)
  const resolved  = resolveReferences(model)

  await saveModel(resolved)
  return resolved
}

/**
 * Sorts files so that "earlier" files in the dependency chain are processed
 * before "later" ones. Modules before screens, screens before flows, and so
 * on. Files that don't match any bucket are appended at the end in their
 * original order.
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
 * Parses the YAML of every extracted file and validates its frontmatter.
 * Files without a YAML frontmatter are dropped silently.
 * If validation fails, the error propagates to the controller.
 */
function validateAndParse(extracted, sortedFiles) {
  return extracted
    .map((item, i) => {
      const yaml = parseYaml(item.yaml)
      if (!yaml) return null

      // Throws on schema mismatch — caught at controller level
      validateFrontmatter(yaml, item.yaml, sortedFiles[i].filename)

      return { yaml, sections: item.sections }
    })
    .filter(Boolean)
}
