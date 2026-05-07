/**
 * sections.config.js
 *
 * Fuente de verdad de qué secciones Markdown (`## Nombre`) son las esperadas
 * para cada `type` de archivo. El model-builder usa esta lista para separar
 * las secciones en dos grupos:
 *   - knownSections: se parsean de forma estructurada (cada tipo tiene sus campos)
 *   - extensions:    se guardan tal cual y aparecen en el diagrama como bloques extra
 *
 * Añadir o quitar secciones esperadas para un tipo solo requiere editar este
 * archivo — no hay que tocar el model-builder.
 *
 * Los nombres de sección se comparan en minúsculas (todo se pasa a minúsculas
 * durante la extracción), así que se listan aquí en minúsculas.
 */

export const EXPECTED_SECTIONS = {
  'modules-index': ['overview'],
  'module':        ['purpose', 'functions', 'state', 'notes'],
  'screen':        ['description', 'elements', 'actions', 'states'],
  'flow':          ['steps', 'error cases', 'notes'],
  'entity':        ['table', 'notes'],
  'system-rules':  ['auth', 'navigation', 'validation', 'conventions', 'technical decisions']
}
