import * as service from './settings.service.js'

export async function getSettings(req, res) {
  try {
    res.json(await service.getSettings(req.userId))
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
}

export async function updateSettings(req, res) {
  try {
    res.json(await service.updateSettings(req.userId, req.body))
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
}
