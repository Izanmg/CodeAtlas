# CodeAtlas

CodeAtlas es una aplicación web que convierte la documentación de un proyecto en **diagramas visuales e interactivos** de su arquitectura. Subes archivos `.md` con un formato estructurado y CodeAtlas dibuja tus módulos, pantallas, flujos y base de datos —y cómo se conectan entre sí— en un lienzo navegable.

Es el proyecto de síntesis del ciclo de **Desarrollo de Aplicaciones Web (DAW)**.

---

## Qué hace

CodeAtlas tiene dos formas de trabajo complementarias:

### 1. Generador de diagramas (núcleo)
- Lee archivos `.md` con el formato de CodeAtlas y los transforma en un **modelo JSON unificado**.
- Dibuja un diagrama interactivo (Vue Flow) con cinco tipos de bloque: backend, frontend, pantallas, base de datos y reglas del sistema.
- **Modo relaciones**: muestra dependencias entre módulos, consumo de API, uso de tablas, navegación entre pantallas y relaciones (FK) de la base de datos.
- **Modo flujos**: superpone los pasos numerados de un flujo de la aplicación sobre los bloques que toca.
- **Deep-dive de módulo**: doble clic en un módulo backend/frontend abre una vista tipo UML con sus archivos, funciones y los `imports` entre ellos.
- Las posiciones de los nodos se pueden reorganizar (con undo/redo) y se guardan por diagrama.

### 2. Asistente IA (generador de `app-doc/`)
- Un chatbot basado en **Google Gemini** que, conversando contigo, redacta los `.md` en el formato de CodeAtlas.
- Valida automáticamente lo que genera y, si algo no cumple el formato, le pide al modelo que lo corrija.
- El resultado se puede descargar como un `.zip` (`app-doc/`) listo para subirlo al generador de diagramas.

Además incluye **autenticación de usuarios**, gestión de **proyectos** y **diagramas**, y **ajustes** de usuario (tema claro/oscuro).

---

## Stack tecnológico

| Parte | Tecnologías |
|-------|-------------|
| **Frontend** | Vue 3 · Vite · Vue Router · Pinia · [Vue Flow](https://vueflow.dev/) · Tailwind CSS · lucide-vue-next |
| **Backend** | Node.js · Express (ES Modules) · MySQL (`mysql2`) · JWT (`jsonwebtoken`) · `bcrypt` · `multer` · `js-yaml` · `jszip` |
| **IA** | Google Gemini (`@google/genai`) |
| **Despliegue** | Docker · Nginx · Kubernetes |

---

## Arquitectura

El flujo principal de datos:

```
Archivos .md  →  Parser (backend)  →  Modelo JSON  →  Frontend  →  Diagrama visual
```

El modelo JSON generado se guarda en base de datos para no tener que reparsear en cada carga. Los `.md` no se guardan: si quieres actualizar un diagrama, vuelves a subirlos.

**Backend modular.** Cada módulo (`auth`, `projects`, `diagrams`, `parser`, `settings`, `bot`) sigue el mismo esquema de capas:

```
[modulo].routes.js       → define los endpoints
[modulo].controller.js   → recibe la petición y devuelve la respuesta (HTTP)
[modulo].service.js      → lógica de negocio
[modulo].repository.js   → consultas a base de datos
```

**Pipeline del parser** (el corazón de la app):

```
archivos .md
  → markdown-source.js  (extrae el frontmatter YAML y las secciones de cada archivo)
  → yaml-parser.js      (convierte el YAML a objeto JS)
  → validator.js        (valida el frontmatter contra el schema)
  → model-builder.js    (ensambla el modelo JSON unificado)
  → resolver.js         (avisa de referencias cruzadas rotas)
  → layout-calculator.js(calcula las posiciones por defecto de cada nodo)
```

---

## Estructura del proyecto

```
aplicacion/
├── backend/                  API Node.js + Express
│   └── src/
│       ├── modules/          auth · projects · diagrams · parser · settings · bot
│       ├── core/             utilidades transversales
│       ├── database/         conexión (db.js) y esquema (schema.sql)
│       ├── app.js            configuración de Express y montaje de routers
│       └── server.js         arranque del servidor HTTP
├── frontend/                 Aplicación Vue 3 + Vite
│   └── src/
│       ├── modules/          un módulo por funcionalidad (views/stores/services)
│       ├── components/       componentes de UI reutilizables
│       ├── router/           rutas centrales (Vue Router)
│       └── lib/              cliente HTTP compartido
├── ia-doc/                   guía y formatos que usa el bot de IA
├── app-doc/                  ejemplo de documentación en el formato de CodeAtlas
├── deploy/                   manifiestos de Kubernetes + guía de despliegue
├── docs/                     documentación interna de desarrollo
└── AGENTS.md                 contexto y convenciones del proyecto
```

---

## Requisitos previos

- **Node.js 18+** y **npm**
- **MySQL 8** (local o remoto)
- Una **API key de Gemini** ([Google AI Studio](https://aistudio.google.com/apikey)) — solo necesaria para el asistente IA

---

## Instalación

```bash
# Dependencias del backend
cd backend
npm install

# Dependencias del frontend
cd ../frontend
npm install
```

---

## Configuración

### Backend — `backend/.env`

Copia `backend/.env.example` a `backend/.env` y rellénalo:

| Variable | Descripción | Por defecto |
|----------|-------------|-------------|
| `PORT` | Puerto del servidor | `3000` |
| `DB_HOST` | Host de MySQL | `localhost` |
| `DB_PORT` | Puerto de MySQL | `3306` |
| `DB_USER` | Usuario de MySQL | `root` |
| `DB_PASSWORD` | Contraseña de MySQL | — |
| `DB_NAME` | Nombre de la base de datos | `codeatlas` |
| `JWT_SECRET` | Secreto para firmar los tokens JWT | — |
| `GEMINI_API_KEY` | API key de Google Gemini (para el bot) | — |

### Frontend — `frontend/.env`

| Variable | Descripción | Por defecto |
|----------|-------------|-------------|
| `VITE_API_URL` | URL base de la API | `http://localhost:3000/api` |

---

## Base de datos

El esquema está en [`backend/src/database/schema.sql`](backend/src/database/schema.sql). Crea la base de datos y carga el esquema:

```bash
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS codeatlas;"
mysql -u root -p codeatlas < backend/src/database/schema.sql
```

Tablas (todas con claves foráneas e integridad referencial mediante `ON DELETE CASCADE`):

| Tabla | Contenido |
|-------|-----------|
| `users` | Cuentas de usuario (email, nombre, hash de contraseña) |
| `user_settings` | Preferencias por usuario (tema) |
| `projects` | Proyectos (contenedor de diagramas) |
| `diagrams` | Diagramas (modelo JSON + layout + contadores) |
| `bot_sessions` | Conversaciones del asistente IA |
| `bot_files` | Archivos `.md` generados en cada conversación |

---

## Ejecución en desarrollo

```bash
# Backend — http://localhost:3000
cd backend
npm run dev          # nodemon, recarga en caliente

# Frontend — http://localhost:5173
cd frontend
npm run dev
```

---

## Build de producción

```bash
# Frontend: genera los estáticos en frontend/dist/
cd frontend
npm run build

# Backend: en producción se arranca con
cd backend
npm start
```

---

## Despliegue

La aplicación está pensada para desplegarse sobre **Kubernetes** con tres componentes (MySQL, backend Node y frontend Vue servido por Nginx, que además hace de proxy de `/api`).

- Imágenes Docker: [`backend/Dockerfile`](backend/Dockerfile) y [`frontend/Dockerfile`](frontend/Dockerfile) (+ [`frontend/nginx.conf`](frontend/nginx.conf)).
- Manifiestos de Kubernetes: carpeta [`deploy/`](deploy/).
- Guía completa paso a paso: [`deploy/GUIA.md`](deploy/GUIA.md).

> El archivo `deploy/01-secret.yaml` contiene credenciales reales (contraseñas, JWT, API key). **No lo subas a un repositorio público.**

Entorno de producción del proyecto: **http://grup5.infla.cat**

---

## API (resumen de endpoints)

Todas las rutas, salvo registro y login, requieren un token JWT en la cabecera `Authorization: Bearer <token>`.

| Módulo | Endpoints principales |
|--------|-----------------------|
| **Auth** | `POST /api/auth/register` · `POST /api/auth/login` · `GET /api/auth/me` · `PATCH /api/auth/me` · `PATCH /api/auth/me/password` |
| **Proyectos** | `GET/POST /api/projects` · `GET/PATCH/DELETE /api/projects/:id` |
| **Diagramas** | `GET /api/diagrams/recent` · `GET/POST /api/projects/:projectId/diagrams` · `GET/PATCH/DELETE /api/diagrams/:id` · `PATCH /api/diagrams/:id/layout` |
| **Parser** | `POST /api/parser/doc` (parsea `.md` de documentación) |
| **Ajustes** | `GET/PATCH /api/settings` |
| **Bot IA** | `GET/POST /api/bot/sessions` · `GET/PATCH/DELETE /api/bot/sessions/:id` · `POST /api/bot/sessions/:id/message` · `GET /api/bot/sessions/:id/zip` |

---

## Formato de documentación

CodeAtlas lee archivos `.md` con un frontmatter YAML y unas secciones concretas según el tipo (`module`, `screen`, `flow`, `entity`, `system-rules`, `modules-index`). Tienes:

- Un **ejemplo completo** en la carpeta [`app-doc/`](app-doc/).
- Las **guías de formato** que usa el asistente IA en [`ia-doc/`](ia-doc/).

La forma más cómoda de generar esta documentación es usar el **asistente IA** integrado, que produce los archivos ya en el formato correcto.

---

## Documentación interna

| Recurso | Contenido |
|---------|-----------|
| [`AGENTS.md`](AGENTS.md) | Contexto del proyecto y convenciones de código |
| [`docs/backend.md`](docs/backend.md) | Funcionamiento general del backend |
| [`docs/frontend.md`](docs/frontend.md) | Funcionamiento general del frontend |
| [`docs/tasks/`](docs/tasks/) | Tareas de desarrollo (activas y completadas) |
