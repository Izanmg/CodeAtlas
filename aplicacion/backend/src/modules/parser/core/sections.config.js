/**
 * sections.config.js
 *
 * Single source of truth for which Markdown `## Section` headers are expected
 * for each `type` of file. The model-builder uses this list to split sections
 * into two groups:
 *   - knownSections: parsed in a structured way (each type has its own fields)
 *   - extensions:    kept as-is and surfaced in the diagram as extra blocks
 *
 * Adding or removing an expected section for a type only requires editing
 * this file — no need to touch the model-builder.
 *
 * Section names are matched case-insensitively (everything is lowercased
 * during extraction), so list them here in lowercase.
 */

export const EXPECTED_SECTIONS = {
  'modules-index': ['overview'],
  'module':        ['purpose', 'functions', 'state', 'notes'],
  'screen':        ['description', 'elements', 'actions', 'states'],
  'flow':          ['steps', 'error cases', 'notes'],
  'entity':        ['table', 'notes'],
  'system-rules':  ['auth', 'navigation', 'validation', 'conventions', 'technical decisions']
}
