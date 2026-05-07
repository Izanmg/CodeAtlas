/**
 * node-meta.js
 *
 * Metadatos visuales de cada tipo de bloque del diagrama. Centraliza
 * etiqueta, icono Lucide y colores para que todos los componentes
 * (canvas, side panel, leyenda, filtros) hablen el mismo idioma.
 */

import { Server, LayoutPanelTop, Monitor, Database, Workflow, Shield } from 'lucide-vue-next'

export const NODE_META = {
  backend:  { label: 'backend',  icon: Server,          color: 'var(--kind-backend)',  bg: 'var(--kind-backend-bg)'  },
  frontend: { label: 'frontend', icon: LayoutPanelTop,  color: 'var(--kind-frontend)', bg: 'var(--kind-frontend-bg)' },
  screen:   { label: 'screen',   icon: Monitor,         color: 'var(--kind-screen)',   bg: 'var(--kind-screen-bg)'   },
  database: { label: 'db',       icon: Database,        color: 'var(--kind-database)', bg: 'var(--kind-database-bg)' },
  flow:     { label: 'flow',     icon: Workflow,        color: 'var(--kind-flow)',     bg: 'var(--kind-flow-bg)'     },
  rules:    { label: 'rules',    icon: Shield,          color: 'var(--kind-rules)',    bg: 'var(--kind-rules-bg)'    },
}

export const KIND_KEYS = ['backend', 'frontend', 'screen', 'database', 'flow', 'rules']
