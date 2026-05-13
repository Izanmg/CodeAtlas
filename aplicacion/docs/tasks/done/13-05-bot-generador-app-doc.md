# Asistente IA — Bot generador de `app-doc/`

**Fecha**: 13-05-2026

Feature nueva: un asistente conversacional (Gemini) que ayuda al usuario a generar la carpeta `app-doc/` con la documentación estructurada en formato CodeAtlas, lista para descargar como `.zip` y subir al creador de diagramas existente. Cubre el requisito obligatorio del ciclo de **integrar al menos un modelo de IA**.

## Motivación

Hasta ahora el usuario tenía que escribir manualmente los `.md` siguiendo el formato definido en `ia-doc/GUIA-IA.md` (~16 KB de instrucciones, 6 tipos de archivos con campos obligatorios y referencias cruzadas entre IDs). Funcional, pero la barrera de entrada era alta.

El bot le quita esa fricción: el usuario describe su aplicación en lenguaje natural y el bot devuelve los `.md` correctamente formateados, validados y listos para parsear.

## Decisiones técnicas clave

### 1. LLM elegido: Gemini 2.5 (Flash o Flash-lite)

- **Descartado Ollama local**: el namespace de infla.cat tiene ~10 GB RAM / 6 CPUs y un modelo pequeño se come 4-8 GB él solo. Inviable en producción.
- **Elegido Gemini 2.5** con dos sabores: `flash` (más capaz, free tier muy restrictivo ~20 req/día en proyectos nuevos) y `flash-lite` (free tier ~1000 req/día). El usuario elige en la UI.
- **Salida estructurada** con `responseSchema` del SDK: el modelo está obligado a devolver `{ reply: string, files: [{ path, content }] }`, no markdown a pelo.

### 2. Sesiones múltiples por usuario

Cada conversación es una sesión independiente con su propio historial y sus propios archivos. El usuario puede tener varias conversaciones en paralelo (ej. una por proyecto), saltar entre ellas y borrarlas. La sesión activa se persiste en `localStorage` para que la recarga del navegador no la pierda.

### 3. Validación + reintento automático

Antes de aceptar los archivos del modelo, el backend valida:
- Path seguro (sin `..`, dentro de `app-doc/`, extensión `.md`)
- Frontmatter YAML parseable y delimitado
- Campos obligatorios según `type` (`module`, `entity`, `screen`, `flow`, etc.)

Si falla, **reintenta una vez** pidiéndole al LLM que corrija los problemas concretos. Si tras el reintento sigue inválido, se devuelven los archivos con un aviso al usuario pero no se persisten.

### 4. Contexto de sesión inyectado en cada turno

Al modelo se le pasa, además del historial y los formatos detallados, una lista de los archivos **ya generados** en la sesión. Así el modelo:
- No regenera archivos existentes salvo que el usuario lo pida
- Reutiliza IDs ya declarados en vez de inventar nuevos
- Mantiene coherencia incluso si el usuario cambia de modelo a mitad de conversación

### 5. Diferenciación de errores 429 de Gemini

Cuando el free tier se agota, el backend parsea el JSON del error y devuelve respuesta estructurada con `code: 'QUOTA_EXCEEDED'`, el modelo que falló y el modelo sugerido como alternativa. El frontend muestra una tarjeta clara con botón "Cambiar a Flash-lite y reintentar" en vez de un error críptico.

## Cambios — Backend

### Base de datos

**`aplicacion/backend/src/database/schema.sql`**

Dos tablas nuevas:

```sql
bot_sessions(id PK, user_id FK, title, history_json, created_at, updated_at)
bot_files(session_id FK, path, content, updated_at, PK(session_id, path))
```

`ON DELETE CASCADE` desde `users(id)` y desde `bot_sessions(id)` → borrar usuario o sesión limpia todo automáticamente.

### Módulo bot

**`aplicacion/backend/src/modules/bot/`** *(módulo nuevo)*

- **`bot.gemini.js`** — wrapper del SDK `@google/genai`. Carga `GUIA-IA.md` + formatos bajo demanda, construye el system prompt completo (guía + formato detectado + estado de sesión), llama a `generateContent` con `responseSchema`. Detecta errores 429 y los relanza como `[bot:quota]` con `model` y `suggestedModel`.
- **`bot.validator.js`** — valida path seguro, frontmatter YAML, campos obligatorios por `type`.
- **`bot.repository.js`** — CRUD de sesiones y archivos en MySQL. UPSERT con `INSERT ... ON DUPLICATE KEY UPDATE` para regenerar archivos.
- **`bot.service.js`** — orquesta el flujo: detecta qué formatos inyectar (heurística regex sobre el mensaje), llama al LLM, valida, reintenta si falla, persiste mensajes + archivos. Auto-renombra la sesión al primer mensaje del usuario.
- **`bot.zip.js`** — genera el `.zip` en memoria con JSZip. JSZip crea los subdirectorios automáticamente desde los paths.
- **`bot.controller.js`** + **`bot.routes.js`** — endpoints REST anidados por sesión:

```
GET    /api/bot/sessions
POST   /api/bot/sessions
GET    /api/bot/sessions/:id
PATCH  /api/bot/sessions/:id
DELETE /api/bot/sessions/:id
POST   /api/bot/sessions/:id/message
GET    /api/bot/sessions/:id/files
DELETE /api/bot/sessions/:id/files?path=...
GET    /api/bot/sessions/:id/zip
```

### app.js

Rutas registradas en `/api/bot` con `requireAuth`.

### Dependencias

`package.json` añade `@google/genai` y `jszip`.

### Variables de entorno

`.env`:
```
GEMINI_API_KEY=...
```

`.env.example` nuevo con plantilla completa.

## Cambios — Frontend

### Capa HTTP enriquecida

**`aplicacion/frontend/src/lib/http.js`** — ahora los errores HTTP llevan `.status` y `.data` adjuntos al `Error`, no solo el mensaje. Permite a los callers distinguir códigos específicos (ej. `QUOTA_EXCEEDED`) sin parsear el mensaje.

### Módulo bot

**`aplicacion/frontend/src/modules/bot/`** *(módulo nuevo)*

- **`services/bot.service.js`** — cliente HTTP del bot. Exporta `MODELS` con etiquetas, `DEFAULT_MODEL`, `modelLabel()`. La descarga del zip va con `fetch` directo (no `http()`) porque la respuesta es binaria.
- **`components/BotTreeNode.vue`** — nodo recursivo del árbol de archivos.
- **`views/BotView.vue`** — pantalla principal del asistente.

### Vista del bot — layout 3 columnas

```
┌──────────────┬──────────────────┬──────────────┐
│ Conversa-    │ Cabecera con     │ Archivos     │
│ ciones       │ título + selector│ generados    │
│ + "Nueva"    │ de modelo        │              │
│              │                  │              │
│              │ [ Chat ]         │ Preview      │
│              │                  │              │
│              │ [ Textarea       │              │
│              │   autogrow ]     │              │
└──────────────┴──────────────────┴──────────────┘
   240px           flex-1               320px
```

Detalles:
- **Sidebar de sesiones** con hora relativa ("hace 3m"), contador de archivos, papelera al hover.
- **Selector de modelo** (Flash / Flash-lite) en pill, persistido en `localStorage`.
- **Textarea con autogrow**: arranca a 38px (una línea), crece hasta 160px, después scroll interno. Vuelve a la altura mínima al enviar.
- **Tarjeta de error de cuota** integrada en el chat cuando llega un 429, con botón directo para cambiar de modelo y reintentar el mismo mensaje sin reintroducirlo.

### Rutas y navegación

**`aplicacion/frontend/src/router/index.js`** — ruta `/bot`.
**`aplicacion/frontend/src/modules/dashboard/views/DashboardView.vue`** — botón "Asistente IA" en la cabecera del dashboard.

## Flujo end-to-end

1. Usuario entra al dashboard → click en **"Asistente IA"** → llega a `/bot`.
2. Backend lista sesiones; si no hay ninguna, el frontend crea una automáticamente.
3. Usuario describe su app en lenguaje natural (modo entrevista o transformación).
4. Backend: carga historial + archivos de la sesión → construye prompt (guía + formato detectado + estado de sesión) → llama a Gemini → valida la respuesta → reintenta si hace falta → persiste mensajes y archivos en BD.
5. Frontend muestra la respuesta del bot, refresca el árbol con los nuevos archivos, permite click en cada uno para preview.
6. Al primer mensaje, la sesión se renombra automáticamente con los primeros ~50 caracteres del mensaje.
7. Usuario pulsa **"Descargar zip"** → backend lee todos los archivos de la sesión → JSZip los empaqueta respetando la jerarquía de carpetas → blob al navegador como `app-doc.zip`.
8. Usuario sube ese mismo zip al creador de diagramas (parser existente) → CodeAtlas dibuja la arquitectura de la app.

## Por qué encaja con el proyecto

- **Reutiliza el parser existente**: lo que produce el bot es exactamente lo que el parser espera. Test de integración gratis.
- **Cumple el requisito de IA del ciclo** sin meter complejidad innecesaria (no hay vector DB, no hay embeddings, no hay agente; solo conversación + generación estructurada).
- **Sin coste**: free tier de Gemini cubre uso normal del proyecto durante el desarrollo y la defensa.

## Limitaciones conocidas (v1)

- **Sin edición manual** de los `.md` desde la UI: el usuario solo puede regenerar archivos pidiéndolo al bot. Decidido por simplicidad — la salida del bot es el contrato, el archivo es transitorio.
- **Una sesión = una `app-doc/` independiente**. No hay forma de seguir trabajando sobre una `app-doc/` previamente subida al parser; el bot solo genera desde cero.
- **El historial no incluye los `.md` enteros**: persistimos solo el `reply` natural del modelo, los archivos van aparte en `bot_files`. Compensado con el bloque de "Estado de sesión" inyectado al system prompt en cada turno.
- **Free tier de Flash muy restrictivo**: proyectos nuevos de Google AI Studio empiezan con 20 RPD para Flash. Mitigado con el selector de modelo que permite saltar a Flash-lite (~1000 RPD).
