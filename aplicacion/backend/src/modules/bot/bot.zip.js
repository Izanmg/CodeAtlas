/**
 * bot.zip.js
 *
 * Construye un .zip en memoria con los archivos de una sesión concreta.
 */

import JSZip from 'jszip'
import { getFiles } from './bot.repository.js'

export async function buildZip(sessionId, userId) {
  const files = await getFiles(sessionId, userId)
  if (!files.length) return null

  const zip = new JSZip()
  for (const file of files) {
    zip.file(file.path, file.content)
  }

  return zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' })
}
