import { http } from '@/lib/http'

function normalize(p) {
  return {
    ...p,
    diagramCount: Number(p.diagram_count ?? p.diagramCount ?? 0),
    createdAt: p.created_at ?? p.createdAt,
    updatedAt: p.last_update ?? p.created_at ?? p.createdAt,
  }
}

export async function fetchAll() {
  const data = await http('/projects')
  return data.map(normalize)
}

export async function fetchById(id) {
  return normalize(await http(`/projects/${id}`))
}

export async function create({ name, description }) {
  return normalize(
    await http('/projects', {
      method: 'POST',
      body: JSON.stringify({ name, description }),
    })
  )
}

export async function bumpDiagramCount(projectId) {
  return fetchById(projectId)
}
