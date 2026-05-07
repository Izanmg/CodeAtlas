/**
 * seed-projects.js
 *
 * Datos semilla de proyectos. Reproduce los proyectos del prototipo de
 * Claude Design. Cuando se conecte el backend real este archivo
 * desaparecerá — los proyectos vendrán de `GET /api/projects`.
 */

export const SEED_PROJECTS = [
  {
    id: 'p_codeatlas',
    name: 'CodeAtlas',
    description: 'Arquitectura de la propia aplicación CodeAtlas',
    diagramCount: 1,
    updatedAt: '2026-05-06T14:22:00Z',
    createdAt: '2026-02-15T09:10:00Z',
    pinned: true,
  },
  {
    id: 'p_lumen',
    name: 'Lumen Analytics',
    description: 'Plataforma interna de métricas para el equipo de producto',
    diagramCount: 3,
    updatedAt: '2026-05-04T11:05:00Z',
    createdAt: '2026-03-22T08:00:00Z',
  },
  {
    id: 'p_mercato',
    name: 'Mercato',
    description: 'Marketplace B2B de proveedores logísticos',
    diagramCount: 2,
    updatedAt: '2026-04-28T16:40:00Z',
    createdAt: '2026-01-10T10:15:00Z',
  },
  {
    id: 'p_arc',
    name: 'Arc Internal Tools',
    description: 'Herramientas internas — onboarding, billing, soporte',
    diagramCount: 0,
    updatedAt: '2026-04-15T09:30:00Z',
    createdAt: '2026-04-15T09:30:00Z',
  },
]
