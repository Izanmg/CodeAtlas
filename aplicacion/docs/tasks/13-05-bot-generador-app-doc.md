# Bot generador de `app-doc/` con IA

**Fecha**: 13-05-2026
**Estado**: implementado (13-05-2026)

---

## Objetivo

Añadir a CodeAtlas un asistente conversacional (bot) que ayude al usuario a generar la carpeta `app-doc/` (documentación estructurada en formato CodeAtlas) y se la entregue lista para descargar como `.zip`. El usuario podrá luego subir ese zip al creador de diagramas existente.

Esto cubre el requisito obligatorio del ciclo de **integrar al menos un modelo de IA**.

---

## Por qué este enfoque

- Reaprovecha el formato CodeAtlas que ya hemos definido (carpeta `ia-doc/` con `GUIA-IA.md` + `formatos/*.md`).
- El parser ya está hecho: lo que produce el bot es exactamente lo que el parser espera, así que es un test de integración gratis.
- Encaja con el MVP actual sin reescribir nada — es una funcionalidad añadida, no un cambio de arquitectura.
- Es vistoso para la defensa oral.

---

## Decisión técnica: qué LLM usar

**Descartado: Ollama local en producción.**
**Why:** El namespace de infla.cat tiene ~10GB RAM y 6 CPUs. Un modelo pequeño tipo Phi-3 mini o Gemma 2B se come 4-8GB él solo, sin contar la latencia de generar en CPU. Inviable para la entrega.

**Elegido: Gemini 2.0 Flash (free tier).**

| API | Context window | Free tier | Verdict |
|---|---|---|---|
| **Gemini 2.0 Flash** | 1M tokens | 15 RPM, 1M TPM, 1500 req/día, context caching gratis | Ganador |
| Groq (Llama 3.3 70B) | 128k | 30 RPM, ~6k TPM | TPM bajo, contexto grande lo ahoga |
| Mistral free | 32k | 1 RPS, 500k TPM | Context window justo |

**How to apply:** Gemini Flash con context caching es lo que vamos a usar. Context window enorme, gratis, soporta `responseSchema` para forzar salida JSON estructurada, y el caching baja muchísimo el coste por archivo después de la primera generación.

---

## Cálculo de tokens (validación de viabilidad)

Por archivo generado:
- `GUIA-IA.md` (system prompt) ≈ 7k tokens
- Un `formatos/*.md` (solo el del tipo que toca) ≈ 3-5k tokens
- Descripción del usuario ≈ 1k tokens
- Salida (un .md) ≈ 1-2k tokens

**Total por archivo: ~13-15k input, ~2k output.**
**Proyecto típico (15-25 archivos): ~300-400k tokens totales.**

Con Gemini Flash free (1M TPM, 1500 req/día) eso es <1% del límite diario. El miedo de quedarnos sin tokens es infundado si gestionamos bien el contexto.

---

## Arquitectura del flujo

### 1. Frontend (Vue) — UI del bot

- Pantalla nueva tipo chat: lista de mensajes + input de texto.
- Detecta uno de los dos modos descritos en `GUIA-IA.md`:
  - **Entrevista**: el bot hace preguntas, el usuario responde.
  - **Transformación**: el usuario describe su app de golpe, el bot genera archivos.
- Panel lateral que muestra los archivos ya generados (árbol tipo explorer).
- Botón "Descargar `app-doc.zip`" cuando hay al menos un archivo generado.
- Botón "Regenerar archivo" sobre cada nodo del árbol.

### 2. Backend (Node.js) — orquestador

**Responsabilidades**:
- Mantener la conversación con Gemini.
- Inyectar dinámicamente el contexto que toca (no mandar los 5 formatos en cada request).
- Validar la salida estructurada antes de aceptarla.
- Acumular los archivos generados por sesión en BD.
- Montar y servir el zip cuando el usuario lo pida.

**Endpoints previstos**:
- `POST /api/bot/message` — envía un mensaje del usuario, devuelve respuesta del bot + archivos nuevos/modificados.
- `GET /api/bot/files/:projectId` — lista los archivos generados de un proyecto.
- `DELETE /api/bot/files/:projectId/:path` — borra un archivo generado.
- `GET /api/bot/zip/:projectId` — descarga el zip final.

### 3. Salida estructurada del LLM

En lugar de pedir markdown crudo, usar `responseSchema` de Gemini para forzar JSON:

```json
{
  "reply": "Texto que el bot le responde al usuario en el chat",
  "files": [
    {
      "path": "app-doc/01-modules.md",
      "content": "---\ntype: modules-index\n..."
    },
    {
      "path": "app-doc/modules/backend/auth-backend-modules.md",
      "content": "---\n..."
    }
  ]
}
```

`files` puede ir vacío si el bot solo está preguntando. Así el frontend renderiza `reply` siempre y actualiza el árbol cuando hay `files`.

### 4. Optimización del contexto (clave para no gastar tokens)

- **System prompt fijo**: solo `GUIA-IA.md` (~7k tokens). Se cachea con context caching de Gemini → se paga solo la primera vez por ~20 minutos.
- **Formato detallado**: se inyecta solo el del tipo que toca generar ese turno (módulo, flujo, etc.).
- **Historial de conversación**: limitado, no mandar toda la conversación si crece mucho. Quizá últimos N mensajes + resumen de archivos ya generados.

### 5. Validación antes de aceptar

Antes de guardar lo que devuelva el LLM:
- Parsear el frontmatter (debe ser YAML válido).
- Comprobar que los campos obligatorios del tipo están presentes (`type`, `id`, etc. según el formato).
- Comprobar que los IDs referenciados existen en archivos ya generados (cuando aplique).
- Si falla validación: reintentar pidiéndole al LLM que corrija (`tu salida tenía estos problemas: ...`).

### 6. Generación del .zip

Usar **JSZip** (más simple que `archiver`):

```js
import JSZip from 'jszip'

const zip = new JSZip()
for (const file of generatedFiles) {
  zip.file(file.path, file.content)  // crea las carpetas automáticamente desde la ruta
}
const buffer = await zip.generateAsync({ type: 'nodebuffer' })
res.setHeader('Content-Type', 'application/zip')
res.setHeader('Content-Disposition', 'attachment; filename="app-doc.zip"')
res.send(buffer)
```

JSZip crea los subdirectorios automáticamente a partir del string de ruta — no hay que crearlos a mano.

---

## Persistencia (implementado en MySQL)

Dos tablas nuevas en `aplicacion/backend/src/database/schema.sql`:

```sql
CREATE TABLE IF NOT EXISTS bot_sessions (
  user_id      CHAR(36) NOT NULL,
  history_json LONGTEXT NOT NULL,
  updated_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS bot_files (
  user_id    CHAR(36)     NOT NULL,
  path       VARCHAR(255) NOT NULL,
  content    LONGTEXT     NOT NULL,
  updated_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, path),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

**Decisiones de diseño:**
- Dos tablas en vez de una con `files_json` para permitir `DELETE` granular sin reescribir todo el conjunto cuando el usuario borra un archivo.
- `ON DELETE CASCADE` desde `users(id)` → si se borra la cuenta, todo el estado del bot se limpia solo.
- `PRIMARY KEY (user_id, path)` en `bot_files` permite `INSERT ... ON DUPLICATE KEY UPDATE` para regenerar archivos sin lógica extra.
- Sesión por usuario, no por proyecto (decisión v1 de las cuestiones abiertas).

Permite:
- Cerrar el bot y volver mañana sin perder progreso.
- Mostrar preview del zip antes de descargar.
- Regenerar archivos individuales sin perder el resto.

---

## Seguridad

- **API key de Gemini siempre en el backend**, nunca en el frontend Vue. Variable de entorno.
- Rate limiting por usuario en el endpoint del bot (para que un usuario no consuma toda la cuota diaria).
- Sanitización de la salida del LLM antes de meterla al zip (no permitir paths con `../`, paths absolutos, etc.).

---

## Conexión con Gemini desde el backend

### 1. Obtener API key (gratis, ~5 min)

1. Ir a https://aistudio.google.com/apikey
2. Login con cuenta Google → "Create API key"
3. Copiar la key (formato `AIza...`)

No requiere tarjeta, no requiere proyecto de Google Cloud, no requiere facturación.

### 2. Variables de entorno

En `aplicacion/backend/.env` (ya usamos `dotenv`):

```
GEMINI_API_KEY=AIza...
```

**Crítico**: asegurar que `.env` está en `.gitignore`. Nunca commitear la key.

### 3. SDK oficial

```bash
npm install @google/genai
```

Es el SDK nuevo de Google. El antiguo `@google/generative-ai` está deprecado, no usarlo.

### 4. Servicio Gemini en el backend

Fichero `backend/src/services/gemini.service.js`:

```js
import { GoogleGenAI } from '@google/genai'

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })

export async function generateContent(systemPrompt, userMessage, responseSchema) {
  const response = await ai.models.generateContent({
    model: 'gemini-2.0-flash',
    contents: userMessage,
    config: {
      systemInstruction: systemPrompt,
      responseMimeType: 'application/json',
      responseSchema: responseSchema,
    },
  })
  return JSON.parse(response.text)
}
```

### 5. Carga del `GUIA-IA.md`

Al arrancar el server, leer `aplicacion/ia-doc/GUIA-IA.md` una sola vez y mantenerlo en memoria. No hay que mandarlo en cada request del frontend al backend — solo el backend lo envía a Gemini.

### 6. Context caching (optimización, opcional v1)

Para no pagar los ~7k tokens de la guía en cada request:

```js
const cache = await ai.caches.create({
  model: 'gemini-2.0-flash',
  config: {
    contents: [{ role: 'user', parts: [{ text: guiaIaContent }] }],
    ttl: '1200s',  // 20 min
  },
})
// Luego en generateContent: config.cachedContent = cache.name
```

Optimización; no hace falta para tener el bot funcional. Aplicar cuando el resto esté estable.

### Estimación de tiempo para esta parte

| Subtarea | Tiempo |
|---|---|
| Obtener API key + meter en `.env` | 5 min |
| `npm install @google/genai` | 1 min |
| Servicio `gemini.service.js` básico | 30 min |
| Endpoint `POST /api/bot/message` que lo use | 1 h |
| Definir `responseSchema` JSON con `{ reply, files[] }` | 30 min |
| Probar con curl/Postman | 30 min |
| **Total backend hablando con Gemini** | **~3 h** |

El resto (validación, zip, frontend, persistencia) es trabajo aparte ya descrito en la arquitectura.

---

## Pasos de ejecución (todos completados)

1. ✅ API key de Gemini obtenida desde Google AI Studio y guardada en `.env`.
2. ✅ Backend: módulo `bot/` con `bot.gemini.js` que llama a Gemini con `responseSchema`.
3. ✅ Backend: validador `bot.validator.js` (path seguro, frontmatter YAML, campos obligatorios por tipo).
4. ✅ Backend: endpoint `GET /api/bot/zip` con JSZip.
5. ✅ Frontend: `BotView.vue` con chat + árbol + preview + descarga.
6. ✅ Persistencia: tablas `bot_sessions` y `bot_files` creadas en MySQL.
7. ⏳ Probar end-to-end con usuario real desde la UI (pendiente del usuario).

---

## Decisiones tomadas sobre las cuestiones abiertas

- **¿Conversación por proyecto o global?** → **Global por usuario** en v1. Una sola sesión por cuenta. Más simple y suficiente para el MVP. Si en v2 se necesita aislar por proyecto, basta añadir `project_id` a las tablas `bot_sessions` y `bot_files` y mover el PK.
- **¿Permitir editar archivos manualmente?** → **No en v1**. El usuario puede borrar archivos individuales y regenerarlos hablando con el bot, pero no edita el .md directamente. La descarga es el punto de salida.
- **¿Qué pasa si el usuario tiene ya una `app-doc/` subida?** → **Fuera de scope v1**. El bot trabaja sobre su propia sesión, independiente del parser. El usuario monta su `app-doc/` con el bot y luego la sube al parser como cualquier otra.
- **¿Mostrar contenido de cada .md o solo árbol?** → **Árbol + click para preview readonly**. Implementado: click en archivo del árbol abre tarjeta con su contenido en `<pre>` debajo.

---

## Archivos creados / modificados

**Backend** (`aplicacion/backend/`):
- `src/modules/bot/bot.gemini.js` (nuevo)
- `src/modules/bot/bot.validator.js` (nuevo)
- `src/modules/bot/bot.repository.js` (nuevo — MySQL)
- `src/modules/bot/bot.service.js` (nuevo)
- `src/modules/bot/bot.zip.js` (nuevo)
- `src/modules/bot/bot.controller.js` (nuevo)
- `src/modules/bot/bot.routes.js` (nuevo)
- `src/app.js` (registrado `/api/bot`)
- `src/database/schema.sql` (tablas `bot_sessions` y `bot_files` añadidas y ejecutadas en BD)
- `package.json` (deps añadidas: `@google/genai`, `jszip`)
- `.env` (variable `GEMINI_API_KEY`)
- `.env.example` (nuevo — plantilla con todas las vars)

**Frontend** (`aplicacion/frontend/`):
- `src/modules/bot/services/bot.service.js` (nuevo — capa HTTP, descarga zip vía blob)
- `src/modules/bot/components/BotTreeNode.vue` (nuevo — árbol recursivo)
- `src/modules/bot/views/BotView.vue` (nuevo — chat + árbol + preview)
- `src/router/index.js` (ruta `/bot`)
- `src/modules/dashboard/views/DashboardView.vue` (botón "Asistente IA")
