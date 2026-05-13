/**
 * node-meta.js
 *
 * Metadatos visuales de cada tipo de bloque del diagrama. Centraliza
 * etiqueta, icono Lucide y colores para que todos los componentes
 * (canvas, side panel, leyenda, filtros) hablen el mismo idioma.
 */

import { Server, LayoutPanelTop, Monitor, Database, Workflow, Shield, FileText } from 'lucide-vue-next'

export const NODE_META = {
  backend:  { label: 'backend',  icon: Server,          color: 'var(--kind-backend)',  bg: 'var(--kind-backend-bg)'  },
  frontend: { label: 'frontend', icon: LayoutPanelTop,  color: 'var(--kind-frontend)', bg: 'var(--kind-frontend-bg)' },
  screen:   { label: 'screen',   icon: Monitor,         color: 'var(--kind-screen)',   bg: 'var(--kind-screen-bg)'   },
  database: { label: 'db',       icon: Database,        color: 'var(--kind-database)', bg: 'var(--kind-database-bg)' },
  flow:     { label: 'flow',     icon: Workflow,        color: 'var(--kind-flow)',     bg: 'var(--kind-flow-bg)'     },
  rules:    { label: 'rules',    icon: Shield,          color: 'var(--kind-rules)',    bg: 'var(--kind-rules-bg)'    },
  file:     { label: 'file',     icon: FileText,        color: 'var(--fg-muted)',      bg: 'var(--bg-muted)'         },
}

// Los flujos ya no se renderizan como nodos del canvas — se incrustan como
// chips dentro de los demás nodos. La metadata `flow` se conserva en NODE_META
// porque sigue usándose para el color/icono del chip y de los edges en modo
// flujos, pero no aparece en KIND_KEYS porque no es un tipo filtrable.
export const KIND_KEYS = ['backend', 'frontend', 'screen', 'database', 'rules']
