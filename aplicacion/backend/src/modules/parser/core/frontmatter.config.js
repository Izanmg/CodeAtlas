/**
 * frontmatter.config.js
 *
 * Definición del schema del frontmatter YAML esperado en cada tipo de archivo.
 * Derivado de los formatos definidos en `estructura-proyecto/lector-de-archivos/`.
 *
 * Cada entrada define:
 *   - required:        campos que siempre deben estar presentes
 *   - requiredByLayer: campos extra requeridos solo para ciertos valores de `layer`
 *                      (actualmente solo lo usa `module`)
 *   - optional:        campos que pueden estar presentes
 *   - types:           tipo JS esperado para cada campo
 *                      ('string', 'boolean', 'array', 'object')
 *
 * El validator usa este schema para lanzar errores precisos que apuntan al
 * archivo y la línea exactos cuando algo no encaja.
 */

export const FRONTMATTER_SCHEMA = {
  'modules-index': {
    required: ['type', 'backend', 'frontend', 'file-types'],
    optional: [],
    types: {
      type: 'string',
      backend: 'array',
      frontend: 'array',
      'file-types': 'object'
    }
  },

  'module': {
    required: ['type', 'layer', 'id', 'name', 'description'],
    requiredByLayer: {
      backend:  ['database', 'api', 'depends-on'],
      frontend: ['screens', 'consumes-api', 'depends-on']
    },
    optional: ['folders', 'files'],
    types: {
      type: 'string',
      layer: 'string',
      id: 'string',
      name: 'string',
      description: 'string',
      database: 'array',
      api: 'array',
      'depends-on': 'array',
      screens: 'array',
      'consumes-api': 'array',
      folders: 'array',
      files: 'array'
    }
  },

  'screen': {
    required: ['type', 'id', 'name', 'description', 'module', 'requires-auth'],
    optional: ['folder', 'file', 'routes', 'navigates-to', 'components'],
    types: {
      type: 'string',
      id: 'string',
      name: 'string',
      description: 'string',
      module: 'string',
      'requires-auth': 'boolean',
      folder: 'string',
      file: 'string',
      routes: 'array',
      'navigates-to': 'array',
      components: 'array'
    }
  },

  'flow': {
    required: ['type', 'id', 'name', 'description', 'trigger'],
    optional: ['screens', 'modules', 'database'],
    types: {
      type: 'string',
      id: 'string',
      name: 'string',
      description: 'string',
      trigger: 'string',
      screens: 'array',
      modules: 'array',
      database: 'array'
    }
  },

  'entity': {
    required: ['type', 'id', 'name', 'description'],
    optional: ['used-by', 'relations'],
    types: {
      type: 'string',
      id: 'string',
      name: 'string',
      description: 'string',
      'used-by': 'array',
      relations: 'array'
    }
  },

  'system-rules': {
    required: ['type'],
    optional: [],
    types: {
      type: 'string'
    }
  }
}

/** Todos los valores válidos para el campo `type` que el parser reconoce. */
export const VALID_TYPES = Object.keys(FRONTMATTER_SCHEMA)

/** Valores válidos para el campo `layer` en archivos de tipo `module`. */
export const VALID_LAYERS = ['backend', 'frontend']
