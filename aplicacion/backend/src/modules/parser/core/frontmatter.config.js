/**
 * frontmatter.config.js
 *
 * Schema definition for the YAML frontmatter expected on each .md file type.
 * Derived from the format files in `estructura-proyecto/lector-de-archivos/`.
 *
 * Each entry defines:
 *   - required:        fields that must always be present
 *   - requiredByLayer: extra fields required only for certain `layer` values
 *                      (currently only used by `module`)
 *   - optional:        fields that may be present
 *   - types:           expected JS type for each field
 *                      ('string', 'boolean', 'array', 'object')
 *
 * The validator uses this to throw precise errors pointing to the offending
 * file and line when something does not match the schema.
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

/** All valid `type` values that the parser recognizes. */
export const VALID_TYPES = Object.keys(FRONTMATTER_SCHEMA)

/** Valid `layer` values for `module` files. */
export const VALID_LAYERS = ['backend', 'frontend']
