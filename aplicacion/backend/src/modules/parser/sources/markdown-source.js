/**
 * markdown-source.js
 *
 * Extracts the YAML frontmatter and Markdown sections from .md file contents.
 *
 * Responsibility: pure extraction. It does not validate, does not transform,
 * does not know which sections are expected. Returns everything it finds and
 * lets later stages (validator, model-builder) decide what to do with it.
 *
 * Why it works on content strings instead of file handles:
 * the same function is reused by the future code parser, which will extract
 * @codeatlas blocks from source files, format them as .md content, and pass
 * them here. That keeps the pipeline shared and removes duplication.
 */

/**
 * Extracts YAML frontmatter and sections from each .md file in the array.
 *
 * @param {Array<{filename: string, content: string}>} files - Array of file objects
 * @returns {Array<{filename: string, yaml: string, sections: object}>}
 *   One entry per file that has a frontmatter. Files without frontmatter are dropped.
 */
export function extractFromMarkdown(files) {
  return files
    .map(file => extractOne(file))
    .filter(Boolean)
}

/**
 * Processes a single file. Returns null if the file has no frontmatter,
 * which signals the caller to drop it.
 */
function extractOne({ filename, content }) {
  const yaml = extractFrontmatter(content)
  if (!yaml) return null

  const sections = extractSections(content)
  return { filename, yaml, sections }
}

/**
 * Extracts the raw YAML string from between the two `---` delimiters.
 * Returns null if no frontmatter is found.
 */
function extractFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---/)
  return match ? match[1] : null
}

/**
 * Extracts every `## Section` block as an object.
 * Keys are the section names lowercased and trimmed.
 * Values are the section bodies as strings (trimmed).
 *
 * Includes ALL sections found — both the ones defined in the format spec
 * (sections.config.js) and any unknown ones. The model-builder is responsible
 * for splitting them into knownSections vs extensions.
 */
function extractSections(content) {
  const sections = {}
  // \Z is not supported in JS regex; we approximate "end of string" with $(?![\s\S])
  const sectionRegex = /^## (.+)$([\s\S]*?)(?=^## |$(?![\s\S]))/gm

  let match
  while ((match = sectionRegex.exec(content)) !== null) {
    const name = match[1].trim().toLowerCase()
    const body = match[2].trim()
    sections[name] = body
  }

  return sections
}
