/**
 * bot.gemini.js
 *
 * Wrapper sobre el SDK de Google Gemini. Encapsula la creación del cliente,
 * la carga del system prompt y la llamada a `generateContent` con salida JSON
 * estructurada.
 *
 * El system prompt se lee una sola vez al cargar el módulo desde
 * `aplicacion/ia-doc/GUIA-IA.md`. Si esa carpeta no existe, el módulo se
 * inicializa igual pero las llamadas fallarán hasta que el archivo esté
 * disponible.
 */

import { GoogleGenAI } from '@google/genai'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname  = path.dirname(__filename)

// La carpeta ia-doc/ está en aplicacion/ia-doc/, paralela a backend/.
// Desde este archivo subimos 4 niveles: bot/ → modules/ → src/ → backend/ → aplicacion/
const IA_DOC_DIR  = path.resolve(__dirname, '../../../../ia-doc')
const GUIA_PATH   = path.join(IA_DOC_DIR, 'GUIA-IA.md')
const FORMATS_DIR = path.join(IA_DOC_DIR, 'formatos')

// Cachés en memoria: la guía y cada formato se leen de disco una sola vez.
let guiaContent = null
let formatsCache = {}

/**
 * Carga (y cachea) el system prompt base desde GUIA-IA.md.
 *
 * @returns {string} Contenido de la guía
 * @throws {Error} Si no se puede leer el archivo
 */
function loadGuia() {
  if (guiaContent !== null) return guiaContent
  try {
    guiaContent = fs.readFileSync(GUIA_PATH, 'utf-8')
  } catch (err) {
    throw new Error(`No se ha podido cargar la guía de IA en ${GUIA_PATH}: ${err.message}`)
  }
  return guiaContent
}

/**
 * Carga (y cachea) un formato detallado concreto desde formatos/<name>.md.
 *
 * @param {string} name - Nombre del formato sin extensión (p. ej. 'modulos')
 * @returns {string} Contenido del formato
 * @throws {Error} Si no se puede leer el archivo
 */
function loadFormat(name) {
  if (formatsCache[name]) return formatsCache[name]
  const filePath = path.join(FORMATS_DIR, `${name}.md`)
  try {
    formatsCache[name] = fs.readFileSync(filePath, 'utf-8')
  } catch (err) {
    throw new Error(`No se ha podido cargar el formato "${name}" en ${filePath}: ${err.message}`)
  }
  return formatsCache[name]
}

// Cliente de Gemini, creado de forma perezosa la primera vez que se usa.
let ai = null

/**
 * Devuelve el cliente de Gemini, creándolo la primera vez. Necesita la variable
 * de entorno GEMINI_API_KEY.
 *
 * @returns {GoogleGenAI} Cliente del SDK de Gemini
 * @throws {Error} Si falta GEMINI_API_KEY
 */
function getClient() {
  if (ai) return ai
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY no está definida en las variables de entorno')
  }
  ai = new GoogleGenAI({ apiKey })
  return ai
}

/**
 * Modelos permitidos. El cliente puede elegir entre estos dos:
 *   - flash:      más capaz, free tier muy restrictivo (~20 req/día).
 *   - flash-lite: algo menos listo pero suficiente para nuestro schema,
 *                 con cuota free mucho más generosa (~1000 req/día).
 *
 * La función `otherModel` devuelve la alternativa para sugerir cuando uno
 * se queda sin cuota.
 */
export const MODELS = {
  'gemini-2.5-flash':      { label: 'Flash' },
  'gemini-2.5-flash-lite': { label: 'Flash-lite' },
}
export const DEFAULT_MODEL = 'gemini-2.5-flash-lite'

/**
 * Dado un modelo, devuelve el otro permitido. Se usa para sugerir cambiar de
 * modelo cuando uno agota su cuota diaria.
 *
 * @param {string} model - Modelo actual
 * @returns {string} El modelo alternativo
 */
export function otherModel(model) {
  return model === 'gemini-2.5-flash' ? 'gemini-2.5-flash-lite' : 'gemini-2.5-flash'
}

/**
 * Detecta si un error proviene de un 429 de cuota de Gemini.
 * El SDK lanza errores con el JSON entero en `message`, así que basta con
 * mirar si contiene los marcadores típicos.
 */
function isQuotaError(err) {
  const msg = err?.message || ''
  return msg.includes('429') || msg.includes('RESOURCE_EXHAUSTED') || msg.includes('quota')
}

/**
 * Schema JSON que se le exige al modelo. El parser de respuesta espera
 * exactamente { reply, files: [{ path, content }] }.
 */
const RESPONSE_SCHEMA = {
  type: 'object',
  properties: {
    reply: {
      type: 'string',
      description: 'Texto que el bot le responde al usuario en el chat'
    },
    files: {
      type: 'array',
      description: 'Archivos generados o regenerados en este turno (vacío si solo se conversa)',
      items: {
        type: 'object',
        properties: {
          path: {
            type: 'string',
            description: 'Ruta relativa dentro de app-doc/, por ejemplo "app-doc/01-modules.md"'
          },
          content: {
            type: 'string',
            description: 'Contenido íntegro del archivo .md, frontmatter YAML incluido'
          }
        },
        required: ['path', 'content']
      }
    }
  },
  required: ['reply', 'files']
}

/**
 * Construye un bloque informativo con los archivos ya generados en la
 * sesión. Se inyecta como parte del system prompt para que el modelo no
 * pierda de vista lo que ya hay (IDs usados, archivos creados) entre turnos
 * — especialmente útil cuando el usuario cambia de modelo a mitad de
 * conversación o tras pasar mucho tiempo.
 *
 * @param {Array<{path: string, content: string}>} existingFiles - Archivos ya generados
 * @returns {string} Bloque de texto para el system prompt (vacío si no hay archivos)
 */
function buildSessionStateBlock(existingFiles) {
  if (!existingFiles?.length) return ''
  const list = existingFiles.map(f => `- ${f.path}`).join('\n')
  return `\n\n---\n\n# Estado actual de la sesión\n\n` +
    `Estos son los archivos que ya has generado en esta conversación y están guardados:\n\n` +
    `${list}\n\n` +
    `Reglas importantes:\n` +
    `- NO regeneres estos archivos a menos que el usuario te lo pida explícitamente.\n` +
    `- Si tienes que referenciar un ID que ya existe en estos archivos, usa el mismo ID, no inventes uno nuevo.\n` +
    `- Si el usuario pide algo nuevo, devuelve únicamente los archivos nuevos (o los regenerados si lo pide).\n` +
    `- Los IDs de los elementos están en el nombre del archivo antes del sufijo. Por ejemplo: ` +
    `\`auth-backend-modules.md\` → id \`auth-backend\`, \`login-screens.md\` → id \`login\`.\n`
}

/**
 * Llama a Gemini con la conversación actual y devuelve la respuesta ya parseada
 * según RESPONSE_SCHEMA. Monta el system prompt (guía base + formatos detallados
 * + estado de la sesión) y traduce los errores de cuota a un error etiquetado
 * [bot:quota] con el modelo alternativo sugerido.
 *
 * @param {Array<{role: 'user'|'model', text: string}>} history
 *   Historial completo de la conversación (último mensaje del usuario incluido).
 * @param {string[]} [formats]
 *   Nombres de formatos a inyectar (sin .md): 'modulos', 'flujos', 'base-datos',
 *   'pantallas', 'reglas'. Si se pasa [], el modelo se apoya solo en GUIA-IA.md.
 * @param {string} [model] - Modelo a usar (por defecto DEFAULT_MODEL)
 * @param {Array<{path: string, content: string}>} [existingFiles] - Archivos ya generados
 * @returns {Promise<{reply: string, files: Array<{path: string, content: string}>}>}
 * @throws {Error} Si el modelo no está soportado, se agota la cuota o la respuesta no es JSON
 */
export async function chat(history, formats = [], model = DEFAULT_MODEL, existingFiles = []) {
  if (!MODELS[model]) {
    throw new Error(`[bot] Modelo no soportado: ${model}`)
  }

  const client = getClient()

  // Construye el system prompt: la guía base + (opcionalmente) los formatos detallados que tocan + estado de la sesión.
  let systemPrompt = loadGuia()
  if (formats.length > 0) {
    const extras = formats.map(name => `\n\n---\n\n# Formato detallado: ${name}\n\n${loadFormat(name)}`).join('')
    systemPrompt += extras
  }
  systemPrompt += buildSessionStateBlock(existingFiles)

  // Adaptamos el historial a la forma que espera el SDK.
  const contents = history.map(msg => ({
    role: msg.role,
    parts: [{ text: msg.text }]
  }))

  let response
  try {
    response = await client.models.generateContent({
      model,
      contents,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: 'application/json',
        responseSchema: RESPONSE_SCHEMA,
        temperature: 0.7
      }
    })
  } catch (err) {
    if (isQuotaError(err)) {
      const quotaErr = new Error(`[bot:quota] Has alcanzado el límite diario de ${MODELS[model].label} en el free tier.`)
      quotaErr.model = model
      quotaErr.suggestedModel = otherModel(model)
      throw quotaErr
    }
    throw err
  }

  const raw = response.text
  if (!raw) {
    throw new Error('Gemini ha devuelto una respuesta vacía')
  }

  try {
    return JSON.parse(raw)
  } catch (err) {
    throw new Error(`La respuesta de Gemini no es JSON válido: ${err.message}\n${raw}`)
  }
}
