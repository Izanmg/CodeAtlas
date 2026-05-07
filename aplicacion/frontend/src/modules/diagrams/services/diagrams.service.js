import { http } from '@/lib/http'

function normalize(d) {
  return {
    ...d,
    createdAt:    d.created_at    ?? d.createdAt,
    projectId:    d.project_id    ?? d.projectId,
    countModules: d.count_modules ?? d.countModules ?? 0,
    countScreens: d.count_screens ?? d.countScreens ?? 0,
    countTables:  d.count_tables  ?? d.countTables  ?? 0,
    countFlows:   d.count_flows   ?? d.countFlows   ?? 0,
  }
}

export async function fetchAll() {
  const data = await http('/diagrams/recent')
  return data.map(normalize)
}

export async function fetchByProject(projectId) {
  const data = await http(`/projects/${projectId}/diagrams`)
  return data.map(normalize)
}

export async function fetchById(id) {
  return normalize(await http(`/diagrams/${id}`))
}

export async function generate({ projectId, name, files }, onProgress) {
  onProgress?.({ progress: 25, label: 'Preparando archivos…' })

  const form = new FormData()
  form.append('name', name)
  for (const f of files) {
    if (f.file instanceof File) form.append('files', f.file, f.name)
  }

  onProgress?.({ progress: 50, label: 'Analizando documentación…' })

  const diagram = await http(`/projects/${projectId}/diagrams`, {
    method: 'POST',
    body: form,
  })

  onProgress?.({ progress: 100, label: '¡Diagrama generado!' })
  return normalize(diagram)
}

export async function remove(id) {
  return http(`/diagrams/${id}`, { method: 'DELETE' })
}
