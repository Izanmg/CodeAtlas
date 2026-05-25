<!--
  BotView.vue

  Pantalla del asistente IA. Layout en tres columnas (desktop):
    - Izquierda:  lista de sesiones del usuario (sidebar)
    - Centro:     chat con la sesión activa
    - Derecha:    árbol de archivos generados + preview

  Una sesión = una conversación independiente. Cada sesión guarda su propio
  historial y sus propios archivos generados. El usuario puede crear nuevas
  sesiones, cambiar entre ellas, borrarlas y descargar el zip de la sesión
  activa.

  La sesión activa se persiste en localStorage para que al recargar el
  navegador se vuelva a la misma conversación.
-->
<script setup>
import { ref, computed, onMounted, nextTick, useTemplateRef, watch } from 'vue'

import AppShell from '@/components/layout/AppShell.vue'
import PageHeader from '@/components/ui/PageHeader.vue'
import Card from '@/components/ui/Card.vue'
import Button from '@/components/ui/Button.vue'
import BotTreeNode from '../components/BotTreeNode.vue'
import {
  Bot, Send, Download, RotateCcw, Folder, AlertCircle,
  Plus, Trash2, MessageSquare
} from 'lucide-vue-next'

import {
  listSessions,
  createSession,
  fetchSession,
  deleteSession as apiDeleteSession,
  sendMessage,
  fetchFiles,
  deleteFile,
  downloadZip,
  MODELS,
  DEFAULT_MODEL,
  modelLabel,
} from '../services/bot.service.js'

const ACTIVE_KEY = 'codeatlas:bot:activeSession'
const MODEL_KEY  = 'codeatlas:bot:model'

const sessions = ref([])
const activeId = ref(null)
const messages = ref([])
const files = ref([])
const input = ref('')
const loading = ref(false)
const switching = ref(false)
const error = ref('')
const quotaError = ref(null) // { message, model, suggestedModel } | null
const validationWarnings = ref([])
const previewFile = ref(null)

// Modelo seleccionado. Se persiste en localStorage entre recargas.
const selectedModel = ref(
  localStorage.getItem(MODEL_KEY) ||
  MODELS.find(m => m.id === DEFAULT_MODEL)?.id ||
  MODELS[0].id
)
watch(selectedModel, (m) => { localStorage.setItem(MODEL_KEY, m) })

const messagesEl = useTemplateRef('messagesEl')
const inputEl = useTemplateRef('inputEl')

const INPUT_MIN_H = 38
const INPUT_MAX_H = 160
const inputFocused = ref(false)

const breadcrumbs = [{ label: 'Inicio', to: '/' }, { label: 'Asistente IA' }]

const WELCOME_MESSAGE = {
  role: 'model',
  text:
    'Hola, soy el asistente de CodeAtlas. Te ayudo a generar la carpeta ' +
    'app-doc/ para tu proyecto. Puedes contarme cómo es tu aplicación ' +
    '(módulos, pantallas, base de datos, flujos...) o pedirme que te haga ' +
    'preguntas paso a paso. ¿Por dónde empezamos?',
}

// Sesión actualmente abierta (la del activeId), o null.
const activeSession = computed(() =>
  sessions.value.find(s => s.id === activeId.value) || null
)

// Árbol de carpetas/archivos generados, para pintarlo en el panel derecho.
const fileTree = computed(() => buildTree(files.value))

// True si se puede enviar: hay texto, no está cargando y hay sesión activa.
const canSend = computed(() =>
  input.value.trim().length > 0 && !loading.value && !!activeId.value
)

onMounted(async () => {
  await refreshSessions()

  // Restaurar sesión activa desde localStorage si existe y pertenece al usuario.
  const stored = localStorage.getItem(ACTIVE_KEY)
  const found = stored && sessions.value.find(s => s.id === stored)
  if (found) {
    await selectSession(found.id)
  } else if (sessions.value.length > 0) {
    await selectSession(sessions.value[0].id)
  } else {
    // No hay ninguna sesión: creamos una para arrancar.
    await onNewSession()
  }
})

watch(activeId, (id) => {
  if (id) localStorage.setItem(ACTIVE_KEY, id)
  else localStorage.removeItem(ACTIVE_KEY)
})

/**
 * Recarga la lista de sesiones del usuario desde la API.
 *
 * @returns {Promise<void>}
 */
async function refreshSessions() {
  try {
    sessions.value = await listSessions()
  } catch (err) {
    error.value = err.message
  }
}

/**
 * Abre una sesión: carga su historial y archivos y la marca como activa.
 * No hace nada si ya era la sesión activa.
 *
 * @param {string} id - Id de la sesión a abrir
 * @returns {Promise<void>}
 */
async function selectSession(id) {
  if (id === activeId.value) return
  switching.value = true
  previewFile.value = null
  validationWarnings.value = []
  error.value = ''
  try {
    const data = await fetchSession(id)
    activeId.value = id
    files.value = data.files || []
    messages.value = data.history?.length
      ? data.history.map(m => ({ role: m.role, text: m.text }))
      : [WELCOME_MESSAGE]
    await scrollToBottom()
  } catch (err) {
    error.value = err.message
  } finally {
    switching.value = false
  }
}

/**
 * Crea una sesión nueva, refresca la lista y la abre.
 *
 * @returns {Promise<void>}
 */
async function onNewSession() {
  try {
    const created = await createSession()
    await refreshSessions()
    await selectSession(created.id)
  } catch (err) {
    error.value = err.message
  }
}

/**
 * Borra una sesión (previa confirmación). Si era la activa, salta a la siguiente
 * o crea una nueva para que siempre haya una conversación abierta.
 *
 * @param {string} id - Id de la sesión a borrar
 * @returns {Promise<void>}
 */
async function onDeleteSession(id) {
  const session = sessions.value.find(s => s.id === id)
  if (!confirm(`¿Borrar la conversación "${session?.title || id}" y todos sus archivos?`)) return
  try {
    await apiDeleteSession(id)
    sessions.value = sessions.value.filter(s => s.id !== id)
    if (activeId.value === id) {
      // Si borramos la activa, saltamos a la siguiente o creamos una nueva.
      if (sessions.value.length > 0) {
        await selectSession(sessions.value[0].id)
      } else {
        activeId.value = null
        messages.value = []
        files.value = []
        await onNewSession()
      }
    }
  } catch (err) {
    error.value = err.message
  }
}

/** Ajusta la altura del textarea al contenido, hasta un máximo (auto-resize). */
function autoResize() {
  const el = inputEl.value
  if (!el) return
  el.style.height = 'auto'
  el.style.height = Math.min(el.scrollHeight, INPUT_MAX_H) + 'px'
}

/**
 * Sincroniza el modelo `input` con el textarea y reajusta su altura.
 *
 * @param {InputEvent} e
 */
function onInput(e) {
  input.value = e.target.value
  autoResize()
}

/**
 * Envía el mensaje al pulsar Enter (Shift+Enter inserta salto de línea).
 *
 * @param {KeyboardEvent} e
 */
function onKeydown(e) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    send()
  }
}

/**
 * Envía un mensaje al bot y procesa la respuesta (texto, archivos generados y
 * posibles avisos de validación). Distingue el error de cuota para ofrecer
 * cambiar de modelo. Acepta un texto opcional para los reintentos automáticos
 * tras cambiar de modelo (en ese caso no se vuelve a añadir al historial).
 *
 * @param {string} [messageText] - Texto a enviar; si se omite, usa el del input
 * @returns {Promise<void>}
 */
async function send(messageText) {
  const text = (messageText ?? input.value).trim()
  if (!text || loading.value || !activeId.value) return

  if (!messageText) {
    input.value = ''
    await nextTick()
    autoResize()
    messages.value.push({ role: 'user', text })
  }

  loading.value = true
  error.value = ''
  quotaError.value = null
  validationWarnings.value = []

  await scrollToBottom()

  try {
    const res = await sendMessage(activeId.value, text, selectedModel.value)
    messages.value.push({ role: 'model', text: res.reply })

    if (res.errors?.length) {
      validationWarnings.value = res.errors
    }

    files.value = await fetchFiles(activeId.value)
    // El backend puede haber renombrado la sesión al primer mensaje.
    await refreshSessions()
  } catch (err) {
    // Error específico de cuota → tarjeta especial con sugerencia de cambio.
    if (err.data?.code === 'QUOTA_EXCEEDED') {
      quotaError.value = {
        message: err.data.error,
        model: err.data.model,
        suggestedModel: err.data.suggestedModel,
        lastMessage: text,
      }
    } else {
      error.value = err.message
      messages.value.push({
        role: 'model',
        text: `[error] ${err.message}`,
      })
    }
  } finally {
    loading.value = false
    await scrollToBottom()
  }
}

/**
 * Cuando el usuario hace click en "Cambiar a X y reintentar" tras un error
 * de cuota, cambiamos el modelo seleccionado y reenviamos el mismo mensaje
 * sin volver a meterlo en el historial visible (ya está ahí).
 */
async function switchModelAndRetry() {
  if (!quotaError.value) return
  const lastMessage = quotaError.value.lastMessage
  selectedModel.value = quotaError.value.suggestedModel
  quotaError.value = null
  await send(lastMessage)
}

/** Hace scroll del chat hasta abajo del todo (tras añadir mensajes). */
async function scrollToBottom() {
  await nextTick()
  if (messagesEl.value) {
    messagesEl.value.scrollTop = messagesEl.value.scrollHeight
  }
}

/** Descarga el zip con los archivos generados en la sesión activa. */
async function onDownload() {
  if (!activeId.value) return
  try {
    await downloadZip(activeId.value)
  } catch (err) {
    error.value = err.message
  }
}

/**
 * Borra un archivo generado (previa confirmación) y lo quita de la lista. Si era
 * el que estaba en preview, cierra el preview.
 *
 * @param {string} path - Ruta del archivo a borrar
 * @returns {Promise<void>}
 */
async function onDeleteFile(path) {
  if (!confirm(`Borrar ${path}?`)) return
  try {
    await deleteFile(activeId.value, path)
    files.value = files.value.filter(f => f.path !== path)
    if (previewFile.value?.path === path) previewFile.value = null
  } catch (err) {
    error.value = err.message
  }
}

/**
 * Abre un archivo en el panel de preview.
 *
 * @param {object} file - Archivo a previsualizar ({ path, content })
 */
function selectFile(file) {
  previewFile.value = file
}

/**
 * Convierte la lista plana de archivos (con rutas tipo "app-doc/modules/x.md")
 * en un árbol de carpetas y archivos para renderizarlo en el panel lateral.
 *
 * @param {Array<{path: string, content: string}>} files - Archivos generados
 * @returns {object} Nodo raíz del árbol ya ordenado
 */
function buildTree(files) {
  const root = { type: 'dir', name: '', children: {} }
  for (const file of files) {
    const parts = file.path.split('/')
    let node = root
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i]
      const isLast = i === parts.length - 1
      if (isLast) {
        node.children[part] = { type: 'file', name: part, path: file.path, content: file.content }
      } else {
        if (!node.children[part]) {
          node.children[part] = { type: 'dir', name: part, children: {} }
        }
        node = node.children[part]
      }
    }
  }
  return sortTree(root)
}

/**
 * Ordena recursivamente el árbol: primero las carpetas y luego los archivos,
 * cada grupo alfabéticamente. Convierte el mapa `children` en un array `entries`.
 *
 * @param {object} node - Nodo del árbol (dir o file)
 * @returns {object} Nodo ordenado
 */
function sortTree(node) {
  if (node.type === 'file') return node
  const entries = Object.values(node.children).map(sortTree)
  entries.sort((a, b) => {
    if (a.type !== b.type) return a.type === 'dir' ? -1 : 1
    return a.name.localeCompare(b.name)
  })
  return { ...node, entries }
}

/**
 * Formatea una fecha como texto relativo corto ("ahora", "hace 5m", "hace 3h",
 * "hace 2d") y cae a fecha absoluta a partir de una semana. Se usa en la lista
 * de sesiones.
 *
 * @param {string} dateStr - Fecha en formato ISO
 * @returns {string} Texto relativo o fecha local
 */
function formatRelativeDate(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  const now = new Date()
  const diffMs = now - d
  const diffMin = Math.floor(diffMs / 60000)
  if (diffMin < 1) return 'ahora'
  if (diffMin < 60) return `hace ${diffMin}m`
  const diffH = Math.floor(diffMin / 60)
  if (diffH < 24) return `hace ${diffH}h`
  const diffD = Math.floor(diffH / 24)
  if (diffD < 7) return `hace ${diffD}d`
  return d.toLocaleDateString()
}
</script>

<template>
  <AppShell :breadcrumbs="breadcrumbs">
    <div class="px-4 sm:px-8 pt-6 sm:pt-8 pb-16" style="max-width: 1400px; margin: 0 auto;">
      <PageHeader
        eyebrow="asistente ia"
        title="Generador de documentación"
        subtitle="Conversa con el bot y descarga tu carpeta app-doc/ lista para subir al creador de diagramas."
      >
        <template #actions>
          <Button
            variant="primary"
            size="md"
            :disabled="!activeId || files.length === 0"
            @click="onDownload"
          >
            <template #icon><Download :size="14" /></template>
            Descargar zip
          </Button>
        </template>
      </PageHeader>

      <div
        class="grid grid-cols-1 lg:grid-cols-[240px_1fr_320px]"
        style="gap: 16px; margin-top: 20px;"
      >
        <!-- Columna izquierda: lista de sesiones -->
        <Card :padding="0">
          <div
            :style="{
              padding: '10px 12px',
              borderBottom: '1px solid var(--border)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }"
          >
            <span
              class="flex-1 text-fg font-semibold"
              style="font-size: 12.5px;"
            >Conversaciones</span>
            <Button variant="secondary" size="xs" @click="onNewSession" title="Nueva conversación">
              <template #icon><Plus :size="12" /></template>
              Nueva
            </Button>
          </div>

          <div
            style="padding: 6px; max-height: calc(100vh - 240px); min-height: 360px; overflow-y: auto;"
          >
            <div
              v-if="sessions.length === 0"
              class="text-fg-faint"
              style="padding: 12px; text-align: center; font-size: 12px;"
            >
              Sin conversaciones todavía.
            </div>

            <button
              v-for="s in sessions"
              :key="s.id"
              class="w-full rounded text-left group"
              :style="{
                padding: '8px 10px',
                marginBottom: '2px',
                background: s.id === activeId ? 'var(--bg-muted)' : 'transparent',
                border: s.id === activeId ? '1px solid var(--border)' : '1px solid transparent',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }"
              @click="selectSession(s.id)"
            >
              <MessageSquare
                :size="12"
                :style="{
                  color: s.id === activeId ? 'var(--accent)' : 'var(--fg-faint)',
                  flexShrink: 0,
                }"
              />
              <div class="flex-1 min-w-0">
                <div
                  class="text-fg font-medium overflow-hidden whitespace-nowrap"
                  style="font-size: 12.5px; text-overflow: ellipsis;"
                >
                  {{ s.title }}
                </div>
                <div
                  class="text-fg-faint"
                  style="font-size: 10.5px; margin-top: 1px;"
                >
                  {{ formatRelativeDate(s.updated_at) }}
                  <span v-if="s.file_count > 0"> · {{ s.file_count }} archivos</span>
                </div>
              </div>
              <span
                class="text-fg-faint opacity-0 group-hover:opacity-100 transition-opacity"
                style="cursor: pointer; padding: 2px; display: flex;"
                title="Borrar conversación"
                @click.stop="onDeleteSession(s.id)"
              >
                <Trash2 :size="11" />
              </span>
            </button>
          </div>
        </Card>

        <!-- Columna central: chat -->
        <Card :padding="0">
          <div
            class="flex flex-col"
            style="height: calc(100vh - 240px); min-height: 480px;"
          >
            <!-- Cabecera del chat con selector de modelo -->
            <div
              :style="{
                padding: '10px 14px',
                borderBottom: '1px solid var(--border)',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
              }"
            >
              <div class="flex-1 min-w-0">
                <div
                  class="text-fg font-semibold overflow-hidden whitespace-nowrap"
                  style="font-size: 13px; text-overflow: ellipsis;"
                >
                  {{ activeSession?.title || 'Sin conversación' }}
                </div>
              </div>
              <div
                class="flex items-center bg-bg-subtle rounded-md"
                :style="{ border: '1px solid var(--border)', padding: '2px' }"
              >
                <button
                  v-for="m in MODELS"
                  :key="m.id"
                  class="rounded transition-colors duration-100"
                  :style="{
                    padding: '4px 10px',
                    fontSize: '11.5px',
                    fontWeight: selectedModel === m.id ? '600' : '500',
                    background: selectedModel === m.id ? 'var(--surface)' : 'transparent',
                    color: selectedModel === m.id ? 'var(--fg)' : 'var(--fg-muted)',
                    border: selectedModel === m.id ? '1px solid var(--border)' : '1px solid transparent',
                    cursor: 'pointer',
                  }"
                  :title="m.hint"
                  @click="selectedModel = m.id"
                >
                  {{ m.label }}
                </button>
              </div>
            </div>

            <div
              ref="messagesEl"
              class="flex-1 overflow-y-auto"
              style="padding: 16px; display: flex; flex-direction: column; gap: 12px;"
            >
              <div v-if="switching" class="text-fg-faint" style="text-align: center; font-size: 12px;">
                Cargando conversación...
              </div>

              <div
                v-for="(msg, i) in messages"
                :key="i"
                class="flex"
                :class="msg.role === 'user' ? 'justify-end' : 'justify-start'"
              >
                <div
                  class="rounded-lg"
                  :class="msg.role === 'user'
                    ? 'bg-accent text-accent-fg'
                    : 'bg-bg-subtle text-fg'"
                  :style="{
                    maxWidth: '85%',
                    padding: '10px 12px',
                    fontSize: '13.5px',
                    lineHeight: '1.55',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                  }"
                >
                  <div
                    v-if="msg.role === 'model'"
                    class="flex items-center text-fg-faint"
                    style="font-size: 11px; gap: 4px; margin-bottom: 4px;"
                  >
                    <Bot :size="11" /> Bot
                  </div>
                  {{ msg.text }}
                </div>
              </div>

              <div v-if="loading" class="flex justify-start">
                <div
                  class="bg-bg-subtle rounded-lg text-fg-muted"
                  style="padding: 10px 12px; font-size: 13px;"
                >
                  Pensando...
                </div>
              </div>

              <!-- Tarjeta de error de cuota con sugerencia de cambio de modelo -->
              <div
                v-if="quotaError"
                class="rounded-lg"
                :style="{
                  background: 'var(--warning-bg, #fef3c7)',
                  border: '1px solid var(--warning, #f59e0b)',
                  padding: '14px 16px',
                  fontSize: '13px',
                  color: 'var(--fg)',
                }"
              >
                <div class="flex items-center" style="gap: 8px; margin-bottom: 6px; font-weight: 600;">
                  <AlertCircle :size="14" :style="{ color: 'var(--warning, #f59e0b)' }" />
                  Límite diario alcanzado
                </div>
                <p style="margin: 0 0 6px 0; line-height: 1.5;">
                  Has agotado la cuota gratuita diaria de
                  <strong>{{ modelLabel(quotaError.model) }}</strong>.
                  La cuota se renueva mañana a las 09:00 (hora peninsular).
                </p>
                <p
                  v-if="quotaError.suggestedModel"
                  style="margin: 0 0 12px 0; line-height: 1.5; color: var(--fg-muted);"
                >
                  Puedes seguir trabajando ahora cambiando a
                  <strong>{{ modelLabel(quotaError.suggestedModel) }}</strong>,
                  que tiene una cuota mucho más amplia.
                </p>
                <div class="flex items-center" style="gap: 8px; flex-wrap: wrap;">
                  <Button
                    v-if="quotaError.suggestedModel"
                    variant="primary"
                    size="sm"
                    @click="switchModelAndRetry"
                  >
                    Cambiar a {{ modelLabel(quotaError.suggestedModel) }} y reintentar
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    @click="quotaError = null"
                  >
                    Cerrar
                  </Button>
                </div>
              </div>

              <div
                v-if="validationWarnings.length"
                class="rounded-md"
                :style="{
                  background: 'var(--warning-bg, #fef3c7)',
                  border: '1px solid var(--warning, #f59e0b)',
                  padding: '10px 12px',
                  fontSize: '12px',
                  color: 'var(--warning, #92400e)',
                }"
              >
                <div class="flex items-center" style="gap: 6px; margin-bottom: 6px; font-weight: 600;">
                  <AlertCircle :size="13" /> Avisos de validación
                </div>
                <ul style="padding-left: 16px; list-style: disc;">
                  <li v-for="(w, i) in validationWarnings" :key="i">{{ w }}</li>
                </ul>
              </div>
            </div>

            <div
              :style="{
                borderTop: '1px solid var(--border)',
                padding: '12px',
                display: 'flex',
                gap: '8px',
                alignItems: 'flex-end',
              }"
            >
              <div
                class="flex-1 min-w-0 bg-surface rounded-md transition-shadow duration-100"
                :class="inputFocused ? 'shadow-focus' : 'shadow-xs'"
                :style="{
                  border: `1px solid ${inputFocused ? 'var(--accent)' : 'var(--border)'}`,
                }"
              >
                <textarea
                  ref="inputEl"
                  :value="input"
                  rows="1"
                  :placeholder="activeId
                    ? 'Describe tu app o responde al bot. Enter envía, Shift+Enter salto de línea.'
                    : 'Crea o selecciona una conversación para empezar.'"
                  :disabled="!activeId || switching"
                  class="w-full bg-transparent border-none outline-none resize-none text-fg block"
                  :style="{
                    padding: '9px 11px',
                    fontSize: '13px',
                    lineHeight: '1.4',
                    height: INPUT_MIN_H + 'px',
                    maxHeight: INPUT_MAX_H + 'px',
                    overflowY: 'auto',
                    fontFamily: 'inherit',
                  }"
                  @input="onInput"
                  @keydown="onKeydown"
                  @focus="inputFocused = true"
                  @blur="inputFocused = false"
                ></textarea>
              </div>
              <Button
                variant="primary"
                size="lg"
                :disabled="!canSend"
                @click="send()"
              >
                <template #icon><Send :size="14" /></template>
                Enviar
              </Button>
            </div>
          </div>
        </Card>

        <!-- Columna derecha: árbol + preview -->
        <div class="flex flex-col" style="gap: 16px;">
          <Card :padding="0">
            <div
              :style="{
                padding: '12px 14px',
                borderBottom: '1px solid var(--border)',
                fontSize: '12.5px',
                fontWeight: 600,
                color: 'var(--fg)',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }"
            >
              <Folder :size="13" /> Archivos generados ({{ files.length }})
            </div>
            <div
              style="padding: 8px; max-height: 360px; overflow-y: auto; font-size: 12.5px;"
            >
              <div
                v-if="files.length === 0"
                class="text-fg-faint"
                style="padding: 10px; text-align: center;"
              >
                Todavía no hay archivos en esta conversación.
              </div>
              <BotTreeNode
                v-for="entry in fileTree.entries"
                :key="entry.name + (entry.path || '')"
                :node="entry"
                :selected="previewFile?.path || ''"
                @select="selectFile"
                @delete="onDeleteFile"
              />
            </div>
          </Card>

          <Card v-if="previewFile" :padding="0">
            <div
              :style="{
                padding: '10px 14px',
                borderBottom: '1px solid var(--border)',
                fontSize: '11.5px',
                color: 'var(--fg-muted)',
                fontFamily: 'monospace',
              }"
            >
              {{ previewFile.path }}
            </div>
            <pre
              :style="{
                margin: 0,
                padding: '12px 14px',
                fontSize: '11.5px',
                fontFamily: 'monospace',
                maxHeight: '280px',
                overflow: 'auto',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                color: 'var(--fg)',
              }"
            >{{ previewFile.content }}</pre>
          </Card>

          <div
            v-if="error"
            class="rounded-md"
            :style="{
              background: 'var(--danger-bg)',
              border: '1px solid var(--danger)',
              color: 'var(--danger)',
              padding: '10px 12px',
              fontSize: '12px',
            }"
          >
            {{ error }}
          </div>
        </div>
      </div>
    </div>
  </AppShell>
</template>
