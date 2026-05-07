/**
 * markdown-source.js
 *
 * Extrae el frontmatter YAML y las secciones Markdown del contenido de
 * cada archivo .md.
 *
 * Responsabilidad: extracción pura. No valida, no transforma y no sabe
 * qué secciones son las esperadas. Devuelve todo lo que encuentra y deja
 * que el resto del pipeline (validator, model-builder) decida qué hacer.
 *
 * Por qué trabaja sobre strings de contenido y no sobre archivos:
 * la misma función la reutiliza el futuro code parser, que extraerá
 * bloques @codeatlas de archivos de código fuente, los formateará como
 * contenido .md y los pasará por aquí. Así el pipeline es compartido y
 * no hay lógica duplicada.
 */

/**
 * Extrae el frontmatter YAML y las secciones de cada archivo .md del array.
 *
 * @param {Array<{filename: string, content: string}>} files - Array de archivos
 * @returns {Array<{filename: string, yaml: string, sections: object}>}
 *   Una entrada por cada archivo que tenga frontmatter. Los archivos sin
 *   frontmatter se descartan.
 */
export function extractFromMarkdown(files) {
  return files
    .map(file => extractOne(file))
    .filter(Boolean)
}

/**
 * Procesa un único archivo. Devuelve null si el archivo no tiene
 * frontmatter, lo que indica al llamador que debe descartarlo.
 */
function extractOne({ filename, content }) {
  const yaml = extractFrontmatter(content)
  if (!yaml) return null

  const sections = extractSections(content)
  return { filename, yaml, sections }
}

/**
 * Extrae el string YAML que hay entre los dos delimitadores `---`.
 * Devuelve null si el archivo no tiene frontmatter.
 */
function extractFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---/)
  return match ? match[1] : null
}

/**
 * Extrae cada bloque `## Sección` como un objeto.
 * Las claves son los nombres de sección en minúsculas y sin espacios sobrantes.
 * Los valores son los contenidos de cada sección como strings (recortados).
 *
 * Incluye TODAS las secciones encontradas — tanto las definidas en el formato
 * (sections.config.js) como las desconocidas. La separación entre secciones
 * conocidas y extensiones la hace model-builder.
 */
function extractSections(content) {
  const sections = {}
  // \Z no existe en regex de JS; aproximamos "fin de string" con $(?![\s\S])
  const sectionRegex = /^## (.+)$([\s\S]*?)(?=^## |$(?![\s\S]))/gm

  let match
  while ((match = sectionRegex.exec(content)) !== null) {
    const name = match[1].trim().toLowerCase()
    const body = match[2].trim()
    sections[name] = body
  }

  return sections
}
