# Manual Técnico

# **CodeAtlas**

### *Documentación técnica del sistema, su arquitectura, instalación y mantenimiento.*

---

\pagebreak

# 1. Información general

## Nombre del proyecto

**CodeAtlas** — Plataforma web modular que transforma documentación Markdown en diagramas visuales navegables de la arquitectura de aplicaciones.

## Versión del documento

**1.0** (alineada con la versión 1.0 del MVP final entregable).

## Fecha de última actualización

**19 de mayo de 2026**

## Autores y responsables

| Rol | Nombre | Contacto |
|---|---|---|
| Autor del proyecto y desarrollador | Izan Mendoza | izanmg2706@gmail.com |
| Tutor académico | *(Asignado por el centro)* | — |

## Historial de versiones

| Versión | Fecha | Cambios principales |
|---|---|---|
| 0.1 | Abril 2026 | MVP del parser de archivos `.md` y persistencia local. |
| 0.2 | Inicio mayo 2026 | Auth, proyectos, vista de diagrama y flujos rediseñados. |
| 0.3 | Mayo 2026 | Deep Dive de módulos, notas en funciones, base de datos MySQL. |
| 0.4 | Mayo 2026 | Asistente IA (Gemini) integrado para generar `app-doc/`. |
| **1.0** | **19/05/2026** | **Versión final entregable del proyecto de síntesis.** |

## Propósito del documento

Este manual está dirigido a **personal técnico** (desarrolladores, administradores de sistemas y mantenedores) que necesite:

- Instalar y desplegar CodeAtlas en un entorno propio.
- Configurar las variables de entorno y la base de datos.
- Entender la arquitectura interna del sistema y sus componentes.
- Mantener, ampliar o auditar el código.
- Diagnosticar y resolver incidencias en producción.

No es un manual de usuario final; para eso existe el documento *«Manual de Usuario — CodeAtlas»*.

---

\pagebreak

# 2. Arquitectura del sistema

## 2.1. Visión general

CodeAtlas se construye como una **aplicación web monolítica modular** dividida en dos procesos independientes que se comunican mediante una API REST sobre HTTP:

```
┌───────────────────────┐        HTTP/JSON         ┌────────────────────────┐
│   Frontend (Vue)      │  ─────────────────────►  │   Backend (Node.js)    │
│   Vite · Pinia        │ ◄─────────────────────   │   Express · MySQL2     │
└───────────────────────┘     JWT Bearer Token     └──────────┬─────────────┘
                                                              │
                                                              ▼
                                                  ┌────────────────────────┐
                                                  │   MySQL 8              │
                                                  │   Base de datos        │
                                                  └────────────────────────┘
                                                              │
                                                              ▼
                                                  ┌────────────────────────┐
                                                  │   Google Gemini API    │
                                                  │   (servicio externo)   │
                                                  └────────────────────────┘
```

### Diagrama de arquitectura general

A alto nivel, el flujo de datos es el siguiente:

```
1. Usuario sube archivos .md desde el frontend
2. El backend recibe los archivos y ejecuta el pipeline del parser:
     extract → parse YAML → validate → build model → resolve refs → layout
3. El JSON resultante se persiste en MySQL (tabla `diagrams`)
4. El frontend lo descarga y lo renderiza con Vue Flow
5. (Opcional) El usuario conversa con el Asistente IA → Gemini genera los .md
```

### Patrones de diseño utilizados

| Patrón | Dónde aplica |
|---|---|
| **Modular monolithic** | Cada módulo (auth, projects, diagrams, parser, bot, settings) es autónomo dentro del mismo proceso. |
| **Layered architecture** | En backend: `routes → controller → service → repository → db`. |
| **Repository pattern** | Cada módulo del backend tiene un `*.repository.js` que aísla las consultas SQL del resto del código. |
| **Service layer** | Toda la lógica de negocio vive en `*.service.js`. Controllers solo traducen HTTP ↔ servicio. |
| **Pipeline (Pipes & Filters)** | El parser está compuesto por etapas encadenadas: extract, parse YAML, validate, build, resolve, layout. |
| **Pinia store (state container)** | En frontend: cada módulo de negocio tiene su propio store reactivo. |
| **Composition API + script setup** | Convención en todos los componentes Vue. |
| **REST sobre JSON** | Toda la comunicación frontend ↔ backend. |
| **JWT stateless auth** | Sesión sin almacenamiento de sesiones en servidor. |
| **Memory storage para uploads** | `multer({ storage: memoryStorage })` evita I/O y limpieza posterior. |

## 2.2. Stack tecnológico implementado

### Frontend

| Tecnología | Versión | Función |
|---|---|---|
| Vue.js | ^3.4 | Framework UI principal (Composition API). |
| Vite | ^5.0 | Bundler y servidor de desarrollo. |
| Vue Router | ^4.2 | Enrutamiento SPA con guards de autenticación. |
| Pinia | ^2.1 | Gestión de estado global (stores reactivos). |
| Vue Flow | ^1.41 | Canvas interactivo de nodos y aristas. |
| Tailwind CSS | ^3.4 | Sistema de utilidades CSS. |
| Lucide Icons | ^0.468 | Iconografía. |
| @vueuse/core | ^10 | Composables auxiliares. |

### Backend

| Tecnología | Versión | Función |
|---|---|---|
| Node.js | ≥ 18 | Runtime JavaScript (ESM). |
| Express | ^4.18 | Framework HTTP. |
| MySQL2 | ^3.22 | Driver MySQL con soporte Promise y pool de conexiones. |
| bcrypt | ^6.0 | Hash de contraseñas (10 salt rounds). |
| jsonwebtoken | ^9.0 | Generación y verificación de JWT. |
| multer | ^1.4 | Middleware de subida de archivos. |
| js-yaml | ^4.1 | Parser de YAML (frontmatter). |
| jszip | ^3.10 | Generación de archivos `.zip` (descarga del bot). |
| @google/genai | ^2.2 | SDK oficial de Google Gemini. |
| cors | ^2.8 | Soporte de CORS. |
| dotenv | ^16 | Carga de variables de entorno. |
| nodemon | ^3.0 *(dev)* | Recarga automática en desarrollo. |

### Base de datos

- **MySQL 8** (o MariaDB compatible).
- Charset recomendado: `utf8mb4`.
- Tipo de tabla: InnoDB (necesario para foreign keys).

## 2.3. Componentes principales

### Frontend

Estructura modular (cada módulo es prácticamente autónomo):

```
aplicacion/frontend/src/
├── main.js                ← bootstrap (Pinia + Router + estilos)
├── App.vue                ← root component
├── router/index.js        ← rutas + guards
├── lib/http.js            ← cliente HTTP centralizado con JWT
├── components/            ← UI compartida (Button, Modal, Card, ...)
└── modules/
    ├── auth/              ← login, registro, JWT en localStorage
    ├── dashboard/         ← listado global de proyectos
    ├── projects/          ← CRUD de proyectos
    ├── diagrams/          ← visor de diagrama y deep dive
    ├── bot/               ← chat con Gemini
    └── settings/          ← perfil, password, tema
```

Cada módulo de frontend contiene típicamente:

- `views/` — pantallas completas (rutas).
- `components/` — piezas reutilizables internas del módulo.
- `stores/` — estado Pinia.
- `services/` — funciones de acceso a la API.

### Backend

```
aplicacion/backend/src/
├── server.js              ← arranque HTTP
├── app.js                 ← configuración de Express + montaje de routers
├── database/
│   ├── db.js              ← pool MySQL2
│   └── schema.sql         ← DDL inicial
├── core/                  ← lógica transversal
└── modules/
    ├── auth/              ← registro, login, JWT, middleware
    ├── projects/          ← CRUD de proyectos
    ├── diagrams/          ← CRUD de diagramas + layout
    ├── parser/            ← pipeline de parseo .md → JSON
    ├── bot/               ← integración con Gemini + sesiones + zip
    └── settings/          ← preferencias del usuario
```

Cada módulo de backend contiene:

- `*.routes.js` — definición de endpoints.
- `*.controller.js` — handler HTTP (parse req, llama al service, devuelve res).
- `*.service.js` — lógica de negocio.
- `*.repository.js` — consultas SQL.

### Base de datos

Seis tablas (ver capítulo 5):

- `users` — cuentas de usuario.
- `projects` — proyectos por usuario.
- `diagrams` — diagramas asociados a un proyecto.
- `user_settings` — preferencias del usuario.
- `bot_sessions` — conversaciones con el asistente IA.
- `bot_files` — archivos generados por el bot dentro de cada sesión.

### Servicios externos

| Servicio | Uso | Dependencia |
|---|---|---|
| **Google Gemini API** | Generación conversacional de la documentación `app-doc/`. | `GEMINI_API_KEY` |

### APIs

CodeAtlas expone una **API REST interna** con prefijo `/api`. Todos los endpoints excepto `POST /api/auth/login` y `POST /api/auth/register` requieren cabecera `Authorization: Bearer <jwt>`. Ver capítulo 7.

---

\pagebreak

# 3. Entorno técnico

## 3.1. Requisitos de hardware

### Servidor (instancia única, despliegue típico)

| Recurso | Mínimo | Recomendado |
|---|---|---|
| CPU | 1 vCPU | 2 vCPU |
| Memoria RAM | 1 GB | 2 GB |
| Almacenamiento | 5 GB SSD | 20 GB SSD |
| Ancho de banda | 1 Mbps | 10 Mbps |

> El consumo principal de memoria viene del parser (procesa todos los archivos en memoria) y de las conexiones del pool de MySQL (10 conexiones por defecto). El frontend, al ser estático tras `vite build`, no consume recursos del servidor de aplicación.

### Capacidad de almacenamiento

- **Por usuario:** dependiente del número de diagramas. Un diagrama típico ocupa entre **20 KB y 200 KB** en `LONGTEXT` (incluye modelo + layout).
- **Sesiones del bot:** una sesión completa con ~30 archivos generados ocupa ~150 KB en `bot_files`.
- **Estimación global:** 1 GB cubre cómodamente cientos de usuarios activos en uso académico.

### Memoria RAM recomendada

- Backend Node.js: ~150 MB en idle, picos hasta ~500 MB durante parseos grandes.
- MySQL 8: 512 MB - 1 GB (`innodb_buffer_pool_size` recomendado).

### Procesador recomendado

Cualquier CPU x86-64 moderna o ARM64. CodeAtlas no realiza tareas CPU-intensive sostenidas; el parseo es puntual.

## 3.2. Requisitos de software

### Sistema operativo

CodeAtlas se ha desarrollado y probado en:

- **Windows 11** (entorno principal de desarrollo).
- **Linux** (Debian/Ubuntu 22.04+ y CentOS 8+ recomendados para producción).
- **macOS 13+** (compatible).

### Servidor web

No hay servidor web dedicado. El backend Express escucha directamente HTTP en el puerto configurado (`PORT`, por defecto `3000`).

**Recomendado en producción:** colocar **Nginx** o **Caddy** como reverse proxy delante para:

- Terminación TLS.
- Servir los archivos estáticos del frontend (`dist/`).
- Gzip / Brotli.
- Rate limiting básico.

### Base de datos

- **MySQL 8.0** o superior.
- **MariaDB 10.6** o superior (compatible).

### Framework utilizado

- **Backend:** Express 4 sobre Node.js (módulos ESM).
- **Frontend:** Vue 3 con Vite 5.

### Lenguajes de programación

- **JavaScript ES2022** (ESM, sin TypeScript).
- **SQL** (DDL en `schema.sql`).
- **YAML** dentro de los `.md` (frontmatter del formato `app-doc/`).
- **DBML** dentro de la sección `## Table` de las entidades de BD del formato.

### Dependencias y librerías

Las dependencias completas se encuentran en:

- `aplicacion/backend/package.json`
- `aplicacion/frontend/package.json`

Resumen de versiones en el capítulo 2.2.

### Herramientas de desarrollo

| Herramienta | Función | Nota |
|---|---|---|
| Node.js ≥ 18 | Runtime. | Obligatorio. |
| npm o pnpm | Gestor de paquetes. | npm utilizado en el proyecto. |
| Git | Control de versiones. | Repositorio del proyecto. |
| VS Code | IDE recomendado. | Con la extensión oficial de Vue. |
| Postman / Insomnia | Pruebas de la API. | Opcional. |
| MySQL Workbench / DBeaver | Cliente SQL. | Opcional. |

---

\pagebreak

# 4. Configuración del sistema

## 4.1. Instalación

### Paso a paso del proceso de instalación

#### 1. Requisitos previos

Antes de empezar, verifica que tienes instalado:

```bash
node --version    # debe ser >= 18
npm --version
mysql --version   # >= 8.0 (o MariaDB equivalente)
git --version
```

#### 2. Clonar el repositorio

```bash
git clone <url-del-repo> codeatlas
cd codeatlas/aplicacion
```

#### 3. Crear la base de datos

Desde la consola de MySQL:

```sql
CREATE DATABASE codeatlas
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

CREATE USER 'codeatlas'@'localhost' IDENTIFIED BY 'una_contraseña_robusta';
GRANT ALL PRIVILEGES ON codeatlas.* TO 'codeatlas'@'localhost';
FLUSH PRIVILEGES;
```

Ejecutar el script de esquema:

```bash
mysql -u codeatlas -p codeatlas < backend/src/database/schema.sql
```

#### 4. Configurar el backend

```bash
cd backend
npm install
cp .env.example .env
```

Edita `backend/.env` y completa los valores (ver tabla más abajo).

#### 5. Configurar el frontend

```bash
cd ../frontend
npm install
```

Comprueba que `frontend/.env` apunta al backend correcto:

```env
VITE_API_URL=http://localhost:3000/api
```

#### 6. Arranque en modo desarrollo

En dos terminales separadas:

**Terminal 1 — backend:**

```bash
cd aplicacion/backend
npm run dev
# Servidor escuchando en el puerto 3000
```

**Terminal 2 — frontend:**

```bash
cd aplicacion/frontend
npm run dev
# Vite arranca en http://localhost:5173
```

Accede a `http://localhost:5173` desde el navegador.

### Configuración del entorno

CodeAtlas toma toda su configuración de **variables de entorno** mediante `dotenv`. El backend lee automáticamente `aplicacion/backend/.env` al arrancar (`dotenv.config()` en `app.js`).

### Variables de entorno necesarias

#### Backend (`aplicacion/backend/.env`)

| Variable | Obligatoria | Por defecto | Descripción |
|---|---|---|---|
| `PORT` | No | `3000` | Puerto HTTP del backend. |
| `DB_HOST` | Sí | `localhost` | Host de MySQL. |
| `DB_PORT` | No | `3306` | Puerto MySQL. |
| `DB_USER` | Sí | `root` | Usuario MySQL. |
| `DB_PASSWORD` | Sí | *(vacío)* | Contraseña MySQL. |
| `DB_NAME` | Sí | `codeatlas` | Nombre de la base de datos. |
| `JWT_SECRET` | **Sí** | `codeatlas_dev_secret` | **Secreto para firmar los JWT.** En producción debe ser una cadena aleatoria larga. |
| `GEMINI_API_KEY` | Sí *(si se usa el bot)* | — | API key de Google AI Studio para Gemini. Sin esta variable el bot lanza un error. |

> **AVISO de seguridad:** **NO** utilices el valor `codeatlas_dev_secret` en producción. Genera un secreto con `openssl rand -hex 32`.

#### Frontend (`aplicacion/frontend/.env`)

| Variable | Obligatoria | Por defecto | Descripción |
|---|---|---|---|
| `VITE_API_URL` | Sí | `http://localhost:3000/api` | URL base de la API del backend. **Debe incluir el prefijo `/api`.** |

> Las variables `VITE_*` se incrustan en el bundle al hacer `npm run build`. Para cambiarlas hay que volver a buildear.

### Archivos de configuración

| Archivo | Función |
|---|---|
| `aplicacion/backend/.env` | Variables de entorno del backend. |
| `aplicacion/backend/.env.example` | Plantilla con todas las variables. **No incluir secretos.** |
| `aplicacion/backend/package.json` | Dependencias y scripts del backend. |
| `aplicacion/frontend/.env` | URL de la API. |
| `aplicacion/frontend/package.json` | Dependencias y scripts del frontend. |
| `aplicacion/frontend/vite.config.js` | Alias `@` → `./src` y plugin de Vue. |
| `aplicacion/frontend/tailwind.config.js` | Configuración de Tailwind. |
| `aplicacion/frontend/postcss.config.js` | Configuración PostCSS. |
| `aplicacion/backend/src/database/schema.sql` | DDL inicial. |

## 4.2. Despliegue

### Procedimiento de despliegue (entorno de producción Linux)

#### 1. Preparar el servidor

```bash
# Como root o con sudo
apt update && apt install -y curl git mysql-server nginx
# Instalar Node.js LTS
curl -fsSL https://deb.nodesource.com/setup_lts.x | bash -
apt install -y nodejs
# Gestor de procesos
npm install -g pm2
```

#### 2. Clonar y construir

```bash
cd /opt
git clone <url-del-repo> codeatlas
cd codeatlas/aplicacion

# Backend
cd backend
npm ci --omit=dev
cp .env.example .env
nano .env   # configurar variables, sobre todo JWT_SECRET y DB_PASSWORD

# Frontend
cd ../frontend
npm ci
# Apuntar VITE_API_URL al dominio público antes del build
echo "VITE_API_URL=https://tu-dominio.com/api" > .env
npm run build
# Resultado: aplicacion/frontend/dist/
```

#### 3. Crear la base de datos

```bash
mysql -u root -p < aplicacion/backend/src/database/schema.sql
```

#### 4. Arrancar el backend con PM2

```bash
cd /opt/codeatlas/aplicacion/backend
pm2 start src/server.js --name codeatlas-api
pm2 save
pm2 startup   # genera el script para iniciar PM2 al arrancar el sistema
```

#### 5. Configurar Nginx como reverse proxy

Archivo `/etc/nginx/sites-available/codeatlas`:

```nginx
server {
    listen 80;
    server_name tu-dominio.com;

    # Frontend estático (build de Vite)
    root /opt/codeatlas/aplicacion/frontend/dist;
    index index.html;

    # SPA fallback
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Proxy a la API
    location /api/ {
        proxy_pass http://127.0.0.1:3000/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # Soporte para uploads grandes
        client_max_body_size 25M;
        proxy_read_timeout 60s;
    }
}
```

Habilitar y recargar:

```bash
ln -s /etc/nginx/sites-available/codeatlas /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx
```

#### 6. Activar HTTPS con Let's Encrypt

```bash
apt install -y certbot python3-certbot-nginx
certbot --nginx -d tu-dominio.com
```

### Configuración de servidores

- **Backend Node.js:** gestionado por **PM2** para reinicio automático y logs centralizados.
- **MySQL 8:** ejecutándose como servicio del sistema (`systemctl enable mysql`).
- **Nginx:** reverse proxy + servidor estático del frontend.

### Scripts necesarios

| Script | Comando | Descripción |
|---|---|---|
| Arranque backend (dev) | `npm run dev` | Backend con nodemon. |
| Arranque backend (prod) | `npm start` | Backend con node directamente. |
| Dev frontend | `npm run dev` | Vite dev server con HMR. |
| Build frontend | `npm run build` | Genera `dist/` listo para servir. |
| Preview frontend | `npm run preview` | Previsualiza el build localmente. |
| Backup BD | `mysqldump -u codeatlas -p codeatlas > backup_$(date +%F).sql` | Backup completo de la BD. |

### Gestión de versiones

- **Versionado del código:** Git, ramas de feature + main.
- **Versionado del manual:** ver capítulo 1 (Historial de versiones).
- **Versionado del schema:** comentarios al final de `schema.sql` con sentencias `ALTER TABLE` para migrar bases preexistentes.

---

\pagebreak

# 5. Base de datos

## 5.1. Modelo de datos

### Diagrama Entidad-Relación

```
┌──────────────┐       1     N     ┌──────────────┐
│    users     │───────────────────│   projects   │
│              │                   │              │
│ id (PK,UUID) │                   │ id (PK,UUID) │
│ email (UNIQ) │                   │ user_id (FK) │
│ name         │                   │ name         │
│ password_hash│                   │ description  │
│ created_at   │                   │ created_at   │
└──────┬───────┘                   │ last_update  │
       │                           └──────┬───────┘
       │ 1                                │ 1
       │                                  │
       │ 1                                │ N
       │                           ┌──────▼───────┐
       │                           │   diagrams   │
       │                           │              │
       │ 1                         │ id (PK,UUID) │
       │                           │ user_id (FK) │
       │                           │ project_id   │
       │                           │ name         │
       │                           │ description  │
       │                           │ model_json   │
       │                           │ layout_json  │
       │                           │ count_*      │
       │                           │ created_at   │
       │                           └──────────────┘
       │ N
       ▼
┌──────────────┐    1     N     ┌──────────────┐
│ user_settings│       │        │ bot_sessions │
│ user_id (PK) │       │        │ id (PK)      │
│ theme        │       └───────►│ user_id (FK) │
└──────────────┘                │ title        │
                                │ history_json │
                                │ created_at   │
                                │ updated_at   │
                                └──────┬───────┘
                                       │ 1
                                       │
                                       │ N
                                ┌──────▼───────┐
                                │  bot_files   │
                                │ session_id   │
                                │ path         │
                                │ content      │
                                │ updated_at   │
                                └──────────────┘
```

### Descripción de tablas

#### `users`

Cuentas de usuario. Identidad propia de cada usuario de la aplicación.

| Columna | Tipo | Nulable | Notas |
|---|---|---|---|
| `id` | `CHAR(36)` | NO | UUID v4 generado con `UUID()` por MySQL. PK. |
| `email` | `VARCHAR(255)` | NO | **UNIQUE**. Identificador de login. |
| `name` | `VARCHAR(255)` | NO | Nombre visible. |
| `password_hash` | `VARCHAR(255)` | NO | Hash bcrypt (10 rounds). |
| `created_at` | `DATETIME` | NO | `DEFAULT CURRENT_TIMESTAMP`. |

#### `projects`

Proyectos creados por cada usuario.

| Columna | Tipo | Notas |
|---|---|---|
| `id` | `CHAR(36)` | PK, UUID. |
| `user_id` | `CHAR(36)` | FK → `users.id`. **ON DELETE CASCADE.** |
| `name` | `VARCHAR(255)` | Nombre visible. |
| `description` | `TEXT` | Opcional. |
| `created_at` | `DATETIME` | Fecha de creación. |
| `last_update` | `DATETIME` | Última modificación. |

#### `diagrams`

Diagramas generados a partir de archivos `.md`. Pertenecen a un proyecto y a un usuario.

| Columna | Tipo | Notas |
|---|---|---|
| `id` | `CHAR(36)` | PK, UUID. |
| `user_id` | `CHAR(36)` | FK → `users.id`. **CASCADE.** Índice `idx_diagrams_user_id`. |
| `project_id` | `CHAR(36)` | FK → `projects.id`. **CASCADE.** Índice `idx_diagrams_project_id`. |
| `name` | `VARCHAR(255)` | Nombre del diagrama. |
| `description` | `TEXT` | Opcional. |
| `model_json` | `LONGTEXT` | JSON del modelo completo (módulos, pantallas, BD, flujos, reglas). |
| `layout_json` | `LONGTEXT` | JSON con las coordenadas por nodo. |
| `count_modules` | `SMALLINT` | Cache del total de módulos. |
| `count_screens` | `SMALLINT` | Cache del total de pantallas. |
| `count_tables` | `SMALLINT` | Cache del total de entidades. |
| `count_flows` | `SMALLINT` | Cache del total de flujos. |
| `created_at` | `DATETIME` | Fecha de creación. |

#### `user_settings`

Preferencias por usuario (1:1 con `users`).

| Columna | Tipo | Notas |
|---|---|---|
| `user_id` | `CHAR(36)` | PK, FK → `users.id`. **CASCADE.** |
| `theme` | `VARCHAR(20)` | `light` o `dark`. Default `light`. |

#### `bot_sessions`

Conversaciones del asistente IA. Una por sesión, contiene el histórico completo.

| Columna | Tipo | Notas |
|---|---|---|
| `id` | `CHAR(36)` | PK, UUID. |
| `user_id` | `CHAR(36)` | FK → `users.id`. **CASCADE.** |
| `title` | `VARCHAR(255)` | Auto-rellenado tras el primer mensaje. |
| `history_json` | `LONGTEXT` | Array JSON con `{ role, text }`. |
| `created_at`, `updated_at` | `DATETIME` | El último se actualiza con `ON UPDATE CURRENT_TIMESTAMP`. |

Índice compuesto: `(user_id, updated_at)` para listar las sesiones de un usuario ordenadas por recencia.

#### `bot_files`

Archivos `.md` generados por el bot dentro de una sesión.

| Columna | Tipo | Notas |
|---|---|---|
| `session_id` | `CHAR(36)` | PK + FK → `bot_sessions.id`. **CASCADE.** |
| `path` | `VARCHAR(255)` | PK. Ruta relativa dentro de `app-doc/`. |
| `content` | `LONGTEXT` | Contenido íntegro del `.md`. |
| `updated_at` | `DATETIME` | `ON UPDATE CURRENT_TIMESTAMP`. |

Clave primaria compuesta `(session_id, path)` para asegurar unicidad por sesión.

### Relaciones entre entidades

| Origen | Cardinalidad | Destino | Comportamiento |
|---|---|---|---|
| `users` | 1 — N | `projects` | CASCADE: borrar el usuario borra sus proyectos. |
| `users` | 1 — N | `diagrams` | CASCADE. |
| `users` | 1 — 1 | `user_settings` | CASCADE. |
| `users` | 1 — N | `bot_sessions` | CASCADE. |
| `projects` | 1 — N | `diagrams` | CASCADE: borrar un proyecto borra sus diagramas. |
| `bot_sessions` | 1 — N | `bot_files` | CASCADE. |

### Índices y claves

- **Primary keys:** UUID en `CHAR(36)` para evitar colisiones entre entornos y facilitar la portabilidad.
- **Índices secundarios:**
  - `users.email` (UNIQUE).
  - `idx_diagrams_user_id`.
  - `idx_diagrams_project_id`.
  - `idx_bot_sessions_user (user_id, updated_at)`.
- **Foreign keys** con `ON DELETE CASCADE` para mantener integridad referencial sin lógica adicional.

## 5.2. Scripts y procedimientos

### Scripts de creación

El esquema completo se encuentra en `aplicacion/backend/src/database/schema.sql`. El archivo usa `CREATE TABLE IF NOT EXISTS`, por lo que es idempotente: ejecutarlo varias veces es seguro.

```bash
mysql -u codeatlas -p codeatlas < aplicacion/backend/src/database/schema.sql
```

### Procedimientos almacenados

CodeAtlas **no usa stored procedures**. Toda la lógica vive en la capa de aplicación (Node.js) para mantener el código observable y testeable.

### Triggers

No se han definido triggers. Las cascadas de borrado se manejan a través de **`ON DELETE CASCADE`** en las foreign keys.

### Backups y recuperación

#### Backup manual

```bash
mysqldump -u codeatlas -p \
  --single-transaction \
  --routines --triggers \
  codeatlas > codeatlas_backup_$(date +%F).sql
```

#### Backup automático recomendado (cron)

```cron
# /etc/cron.d/codeatlas-backup
0 3 * * * codeatlas /usr/bin/mysqldump -u codeatlas -p'PASSWORD' codeatlas > /var/backups/codeatlas/$(date +\%F).sql
```

#### Restauración

```bash
mysql -u codeatlas -p codeatlas < codeatlas_backup_2026-05-19.sql
```

#### Migración de bases preexistentes

Las migraciones manuales necesarias para mantener bases creadas en versiones anteriores se documentan al final de `schema.sql`:

- Añadir las columnas `count_modules`, `count_screens`, `count_tables`, `count_flows`.
- Poblar `diagrams.user_id` a partir de `projects.user_id` y añadir su FK + índice.

---

\pagebreak

# 6. Estructura del código

## 6.1. Organización del proyecto

### Estructura de directorios

```
CodeAtlas/                                ← raíz del repositorio
├── aplicacion/                           ← código de la aplicación
│   ├── backend/
│   │   ├── package.json
│   │   ├── .env, .env.example
│   │   └── src/
│   │       ├── server.js                 ← punto de entrada HTTP
│   │       ├── app.js                    ← configuración Express
│   │       ├── core/                     ← lógica transversal
│   │       ├── database/
│   │       │   ├── db.js                 ← pool MySQL2
│   │       │   └── schema.sql            ← DDL
│   │       └── modules/
│   │           ├── auth/                 ← autenticación + JWT
│   │           ├── projects/             ← CRUD proyectos
│   │           ├── diagrams/             ← CRUD diagramas + layout
│   │           ├── parser/               ← pipeline .md → JSON
│   │           ├── bot/                  ← asistente IA (Gemini)
│   │           └── settings/             ← preferencias usuario
│   ├── frontend/
│   │   ├── package.json
│   │   ├── vite.config.js
│   │   ├── tailwind.config.js
│   │   ├── .env
│   │   ├── index.html
│   │   ├── public/                       ← logos, assets estáticos
│   │   └── src/
│   │       ├── main.js                   ← bootstrap
│   │       ├── App.vue                   ← root
│   │       ├── router/index.js           ← rutas + guards
│   │       ├── lib/http.js               ← cliente HTTP con JWT
│   │       ├── styles/main.css           ← tokens + Tailwind + Vue Flow
│   │       ├── components/               ← UI compartida
│   │       └── modules/
│   │           ├── auth/                 ← login y registro
│   │           ├── dashboard/            ← listado global
│   │           ├── projects/             ← detalle de proyecto
│   │           ├── diagrams/             ← visor y deep dive
│   │           ├── bot/                  ← chat IA
│   │           └── settings/             ← perfil y preferencias
│   ├── ia-doc/                           ← guía del prompt + formatos
│   │   ├── GUIA-IA.md
│   │   └── formatos/
│   └── docs/                             ← documentación interna del desarrollo
├── estructura-proyecto/                  ← diseño previo y referencia
├── documentos-clase/                     ← entregables académicos
└── README.md
```

### Convenciones de nomenclatura

| Elemento | Convención | Ejemplo |
|---|---|---|
| Archivos JS de backend | `kebab-case.layer.js` | `auth.controller.js`, `bot.gemini.js` |
| Componentes Vue | `PascalCase.vue` | `DiagramView.vue`, `SidePanel.vue` |
| Composables | `useXxx.js` | `useAuthStore`, `useVueFlow` |
| Variables y funciones JS | `camelCase` | `findByEmail`, `verifyToken` |
| Constantes | `UPPER_SNAKE_CASE` | `JWT_SECRET`, `MAX_SUGGESTIONS` |
| Endpoints | `kebab-case` en URL | `/api/bot/sessions`, `/api/diagrams/recent` |
| Identificadores `.md` | `kebab-case` | `auth-backend`, `users` |
| Tablas SQL | `snake_case` plural | `bot_sessions`, `user_settings` |
| Columnas SQL | `snake_case` | `password_hash`, `model_json` |

### Patrones implementados

Ver capítulo 2.1. En particular dentro del **backend**:

- Cada módulo se monta en `app.js` con `app.use('/api/<modulo>', router)`.
- El flujo dentro de un módulo es siempre **routes → controller → service → repository → db**.
- Errores de validación de archivos `.md` se identifican porque su mensaje empieza por `[nombre-archivo]`. El controller los mapea a HTTP 400.

Dentro del **frontend**:

- Cada vista carga su store y/o llama a su service.
- El cliente HTTP centralizado (`lib/http.js`) inyecta el JWT y maneja errores de forma uniforme.
- El estado se persiste en `localStorage` con claves prefijadas `codeatlas:` (sesión, modelo del bot, sesión activa).

## 6.2. Componentes principales

### Módulo `auth` (backend)

- `auth.controller.js` — handlers de `/register`, `/login`, `/me`, `/me/password`.
- `auth.service.js` — hash con bcrypt, generación/verificación de JWT, cambio de contraseña.
- `auth.repository.js` — `findByEmail`, `findById`, `createUser`, `updateUser`, `updatePassword`.
- `auth.middleware.js` — `requireAuth`: valida la cabecera `Authorization: Bearer ...`.

### Módulo `projects` (backend)

- CRUD básico filtrado siempre por `user_id`. Si un usuario intenta acceder a un proyecto ajeno recibe 404 (no 403, para no revelar su existencia).

### Módulo `diagrams` (backend)

- `diagrams.controller.js` — recibe los `multipart/form-data` con archivos `.md`.
- `diagrams.service.js` — verifica acceso al proyecto, invoca al parser, persiste.
- `diagrams.repository.js` — consultas + serialización de `model_json` y `layout_json`.
- Endpoints especiales:
  - `PATCH /:id/layout` — guarda solo el layout (drag & drop).
  - `PATCH /:id/modules/:moduleId/layout` — layout del Deep Dive.

### Módulo `parser` (backend) — **el corazón del sistema**

Pipeline de seis etapas en `parser.service.js`:

```
1. sortFiles            ← orden lógico (índice → módulos → BD → pantallas → flujos → reglas)
2. extractFromMarkdown  ← separa frontmatter YAML de las secciones ##
3. parseYaml + validate ← convierte YAML a objeto y valida contra el schema
4. buildModel           ← ensambla el modelo JSON unificado
5. resolveReferences    ← chequea referencias cruzadas entre elementos
6. calculateLayout      ← coordenadas iniciales por nodo
```

Subcarpetas:

- `sources/markdown-source.js` — separación frontmatter ↔ contenido.
- `core/yaml-parser.js` — wrapper sobre `js-yaml`.
- `core/sections.config.js`, `core/frontmatter.config.js` — schema por tipo.
- `core/validator.js` — validación estricta.
- `core/model-builder.js` — construye el JSON unificado.
- `core/resolver.js` — chequea referencias.
- `core/layout-calculator.js` — asigna coordenadas.

### Módulo `bot` (backend)

- `bot.controller.js` — orquesta sesiones y mensajes.
- `bot.service.js` — lógica de aplicación.
- `bot.gemini.js` — wrapper sobre `@google/genai`, con system prompt cargado desde `aplicacion/ia-doc/GUIA-IA.md`.
- `bot.zip.js` — empaqueta los archivos generados en un `.zip` con `jszip`.
- `bot.validator.js` — valida los `.md` que produce el modelo antes de devolverlos al cliente.
- `bot.repository.js` — persistencia de sesiones e historial.

Modelos soportados:

- `gemini-2.5-flash` — más capaz, cuota gratuita reducida.
- `gemini-2.5-flash-lite` — cuota más amplia (default).

Si Gemini devuelve un 429 (quota exhausted), el wrapper lanza un error especial con `{ model, suggestedModel }` para que el frontend ofrezca al usuario cambiar de modelo y reintentar.

### Módulo `settings` (backend)

- `GET /api/settings` — devuelve preferencias o las crea con default.
- `PATCH /api/settings` — actualiza el tema (`light` / `dark`).

### Frontend — stores Pinia

| Store | Responsabilidad |
|---|---|
| `auth.store` | Usuario actual + JWT en `localStorage`. Login, register, logout, update, change password. |
| `projects.store` | Lista y caché de proyectos. Fetch, create, update, delete. |
| `diagrams.store` | Diagramas por proyecto + reciente + by id. Generate, update, saveLayout, remove. |
| `settings.store` | Tema activo. Carga inicial + actualización con persistencia en BD. |

### Frontend — componentes clave del visor

- `DiagramView.vue` — canvas principal con Vue Flow.
- `ModuleDeepDiveView.vue` — canvas interno de un módulo.
- `CanvasToolbar`, `CanvasLegend`, `CanvasRules`, `CanvasFlowPanel`, `CanvasFlowSelector` — barras y paneles flotantes.
- `SidePanel` — detalle del nodo seleccionado.
- `nodes/*Node.vue` — un componente custom por cada tipo de nodo.
- `FloatingEdge` — aristas con conexión flotante punto-a-punto.
- `core/auto-layout.js`, `core/auto-layout-deep.js` — layout inicial de nodos.

### Interfaces (contratos JSON)

#### Contrato `model_json` (resumido)

```json
{
  "modules": [ { "id", "layer", "name", "description", "depends-on": [], ... } ],
  "screens": [ { "id", "name", "module", "requires-auth", ... } ],
  "database": [ { "id", "name", "fields": [], "relations": [] } ],
  "flows":    [ { "id", "name", "trigger", "steps": [ { "ref", "nodeId", "text" } ] } ],
  "systemRules": { "Auth": [...], "Conventions": [...] },
  "overview": "..."
}
```

#### Contrato `layout_json`

```json
{
  "auth-backend": { "x": 120, "y": 220 },
  "users": { "x": 540, "y": 180 },
  "...": "..."
}
```

---

\pagebreak

# 7. APIs e interfaces

## 7.1. APIs internas

La API REST se sirve bajo el prefijo `/api`. Todas las respuestas son JSON salvo el `204 No Content` (sin cuerpo) y la descarga `zip` del bot (`application/zip`).

### Formato general

- **Petición:** `Content-Type: application/json` (excepto subidas de archivos, que usan `multipart/form-data`).
- **Respuesta de éxito:** código 2xx + cuerpo JSON o vacío.
- **Respuesta de error:** código 4xx/5xx + `{ "error": "Mensaje" }` (o `{ "code": "QUOTA_EXCEEDED", "model": "...", "suggestedModel": "..." }` para errores específicos).

### Autenticación y autorización

- **Esquema:** JWT estatico (Bearer Token).
- **Cabecera obligatoria** en todas las rutas excepto `/auth/login` y `/auth/register`:

```http
Authorization: Bearer <token>
```

- El middleware `requireAuth` decodifica el JWT y añade `req.userId`. Si el token está ausente, mal formado o caducado devuelve **401**.
- Cada `service` y `repository` filtra por `userId` para garantizar el aislamiento entre usuarios.

### Endpoints disponibles

#### Módulo `auth` — `/api/auth`

| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| POST | `/register` | público | Crea cuenta. Body: `{ name, email, password }`. Devuelve `{ user, token }`. |
| POST | `/login` | público | Devuelve `{ user, token }`. |
| GET | `/me` | sí | Devuelve datos del usuario autenticado. |
| PATCH | `/me` | sí | Actualiza `name` y/o `email`. |
| PATCH | `/me/password` | sí | Body: `{ currentPassword, newPassword, confirmPassword }`. |

#### Módulo `projects` — `/api/projects`

| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| GET | `/` | sí | Lista de proyectos del usuario. |
| POST | `/` | sí | Crea proyecto. Body: `{ name, description }`. |
| GET | `/:id` | sí | Detalle de un proyecto. |
| PATCH | `/:id` | sí | Actualiza nombre/descripción. |
| DELETE | `/:id` | sí | Borra el proyecto (CASCADE en BD). |

#### Módulo `diagrams` — `/api` y `/api/projects`

| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| GET | `/projects/:projectId/diagrams` | sí | Diagramas del proyecto. |
| POST | `/projects/:projectId/diagrams` | sí (multipart) | Genera un diagrama. Form: `name` + `files[]` (.md). |
| GET | `/diagrams/recent` | sí | Diagramas más recientes del usuario. |
| GET | `/diagrams/:id` | sí | Diagrama completo (model + layout). |
| PATCH | `/diagrams/:id` | sí (multipart) | Actualiza nombre y opcionalmente regenera con nuevos archivos. |
| PATCH | `/diagrams/:id/layout` | sí | Guarda posiciones. Body: `{ layout: { id: {x,y} } }`. |
| PATCH | `/diagrams/:id/modules/:moduleId/layout` | sí | Guarda posiciones del Deep Dive. |
| DELETE | `/diagrams/:id` | sí | Elimina el diagrama. |

#### Módulo `parser` — `/api/parser` (uso técnico, no expuesto desde la UI)

| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| POST | `/doc` | sí (multipart) | Parsea archivos `.md` y devuelve `{ model, layout }`. |
| POST | `/code` | sí (multipart) | Reservado para análisis de código fuente (no implementado en v1.0). |

#### Módulo `settings` — `/api/settings`

| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| GET | `/` | sí | Preferencias del usuario. |
| PATCH | `/` | sí | Actualiza el tema. Body: `{ theme: 'light' \| 'dark' }`. |

#### Módulo `bot` — `/api/bot`

| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| GET | `/sessions` | sí | Sesiones del usuario. |
| POST | `/sessions` | sí | Crea sesión vacía. |
| GET | `/sessions/:sessionId` | sí | Sesión completa (history + files). |
| PATCH | `/sessions/:sessionId` | sí | Renombrar. |
| DELETE | `/sessions/:sessionId` | sí | Borra sesión (CASCADE de files). |
| POST | `/sessions/:sessionId/message` | sí | Envía mensaje. Body: `{ text, model }`. Llama a Gemini. |
| GET | `/sessions/:sessionId/files` | sí | Lista de archivos generados. |
| DELETE | `/sessions/:sessionId/files?path=...` | sí | Borra un archivo. |
| GET | `/sessions/:sessionId/zip` | sí | Descarga ZIP de la sesión. |

### Códigos HTTP utilizados

| Código | Significado en CodeAtlas |
|---|---|
| 200 OK | Operación correcta con cuerpo. |
| 201 Created | Recurso creado (login, register, crear proyecto, generar diagrama). |
| 204 No Content | Operación correcta sin cuerpo (delete, save layout). |
| 400 Bad Request | Validación fallida; errores `[archivo.md] ...` del parser. |
| 401 Unauthorized | Token ausente, inválido o caducado. |
| 403 Forbidden | Intento de acceso a recurso de otro usuario. |
| 404 Not Found | Recurso inexistente (o pertenece a otro usuario). |
| 429 Too Many Requests | Cuota del bot agotada — el wrapper lo traduce a `{ code: "QUOTA_EXCEEDED", ... }`. |
| 500 Internal Server Error | Error no controlado. |

## 7.2. APIs externas

### Servicios de terceros utilizados

#### Google Gemini API

- **Proveedor:** Google AI Studio — `https://aistudio.google.com/`.
- **SDK:** `@google/genai` (oficial, versión `^2.2`).
- **Modelos soportados por CodeAtlas:**
  - `gemini-2.5-flash` (Flash) — capacidad mayor, cuota gratuita muy limitada (~20 req/día).
  - `gemini-2.5-flash-lite` (Flash-lite) — cuota más generosa (~1000 req/día). **Modelo por defecto.**
- **Modo:** generación de respuesta JSON estructurada (`responseMimeType: 'application/json'` + `responseSchema`).
- **System prompt:** se carga desde `aplicacion/ia-doc/GUIA-IA.md` la primera vez y se cachea en memoria; los formatos detallados (`modulos.md`, `flujos.md`, etc.) se cargan bajo demanda.
- **Temperature:** `0.7`.

### Configuración

```env
GEMINI_API_KEY=AIzaSy...    # generada en Google AI Studio
```

### Gestión de credenciales

- Se almacenan **únicamente** en `aplicacion/backend/.env`.
- Nunca se commitean (existe `.env.example` como plantilla).
- En despliegues en cloud, usar el sistema de secrets del proveedor (AWS Secrets Manager, GCP Secret Manager, etc.) y exponerlas como variables de entorno al proceso.

---

\pagebreak

# 8. Seguridad

## 8.1. Mecanismos de seguridad

### Autenticación

- Esquema **JWT estático** (sin refresh tokens) firmado con HS256.
- Secreto en `JWT_SECRET` (variable de entorno). **Si no se define, el backend usa `codeatlas_dev_secret`** — válido solo en local.
- Tokens emitidos con `expiresIn: '7d'`.
- Persistencia del lado cliente en `localStorage` bajo la clave `codeatlas:auth`.
- Validación: middleware `requireAuth` en `aplicacion/backend/src/modules/auth/auth.middleware.js`.

### Autorización

- Modelo simple **propietario de recurso**: cada usuario ve únicamente sus propios datos.
- Implementación: filtro `WHERE user_id = ?` en todas las queries de proyectos, diagramas, sesiones y archivos del bot.
- Para `diagrams` se hace un **doble check** (vía service `verifyProjectAccess`) al crear un diagrama, asegurando que el proyecto destino pertenece al usuario.

### Encriptación

- **Contraseñas:** `bcrypt` con **10 salt rounds**. No se almacenan ni se devuelven nunca en texto claro.
- **Tránsito:** se delega en el reverse proxy (Nginx + Let's Encrypt). El backend escucha HTTP plano internamente.
- **Datos en reposo:** texto plano en MySQL (configuración por defecto). En despliegues sensibles puede activarse cifrado a nivel de tablespace o de filesystem (cifrado de disco / LUKS / BitLocker).

### Gestión de sesiones

- Sin estado en servidor. La sesión es el JWT.
- Logout: elimina el token del `localStorage` del cliente. El backend no necesita hacer nada.
- Expiración: 7 días desde la emisión.

## 8.2. Políticas

### Control de acceso

- Todas las rutas son **authenticated by default** salvo `POST /api/auth/login` y `POST /api/auth/register`.
- El middleware `requireAuth` se aplica a nivel de router en cada módulo (`router.use(requireAuth)`).
- Los recursos están particionados por `user_id`.

### Gestión de contraseñas

- **Mínimo recomendado:** 8 caracteres (validado en frontend; el backend acepta cualquier longitud al crear cuenta pero rechaza < 8 en cambio de contraseña).
- **Hash:** bcrypt con factor 10.
- **Cambio:** requiere contraseña actual + nueva + confirmación.
- **Recuperación por email:** **no implementada en v1.0** (limitación conocida; recuperación manual por el administrador).

### Protocolos de seguridad

- **HTTPS obligatorio en producción.** Configurado a nivel de Nginx + certbot.
- **CORS:** habilitado de forma permisiva (`app.use(cors())`). Para despliegues más estrictos se puede limitar al dominio del frontend pasando `cors({ origin: 'https://tu-dominio.com', credentials: true })`.
- **Tamaño máximo de subida:** definido por `client_max_body_size` en Nginx (25 MB recomendado).
- **Inyección SQL:** mitigada por uso sistemático de consultas parametrizadas con `mysql2/promise` (placeholders `?`).
- **XSS:** Vue renderiza con escaping automático. Los contenidos `.md` solo se muestran como texto (no se renderizan como HTML peligroso).

### Logs y auditoría

- Sin sistema de auditoría formal en v1.0. Los logs HTTP los proporciona el servidor (Express logging mínimo + Nginx access logs).
- **Recomendación futura:** añadir middleware `morgan` y persistir en archivo rotado.

---

\pagebreak

# 9. Monitorización y mantenimiento

## 9.1. Logs

### Sistema de logging

- **Backend:** `console.log` / `console.error` redirigidos a stdout/stderr. PM2 los captura.
- **Nginx:** access logs y error logs estándar.
- **MySQL:** error log y general/slow query logs (deshabilitados por defecto).

### Ubicación de los logs

| Componente | Ruta típica |
|---|---|
| Backend (PM2) | `~/.pm2/logs/codeatlas-api-out.log`, `~/.pm2/logs/codeatlas-api-error.log` |
| Nginx | `/var/log/nginx/access.log`, `/var/log/nginx/error.log` |
| MySQL | `/var/log/mysql/error.log` |

### Formato de los logs

- **Backend:** texto plano por línea (`console.log` directo). Si se añade `morgan`, formato Apache combined.
- **Nginx:** combined log format.

### Rotación y retención

- **PM2:** instalar y configurar `pm2-logrotate`:

```bash
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 14
pm2 set pm2-logrotate:compress true
```

- **Nginx:** rotación gestionada por `logrotate` del sistema (`/etc/logrotate.d/nginx`).
- **MySQL:** similar.

## 9.2. Monitorización

### Herramientas de monitorización

CodeAtlas en v1.0 **no incluye monitorización avanzada**. Para despliegues serios se recomiendan:

| Herramienta | Función |
|---|---|
| **PM2 monit** | Métricas básicas en tiempo real del proceso Node. |
| **Uptime Robot** o **Better Stack** | Health checks externos del endpoint público. |
| **Grafana + Prometheus** | Solución completa si se integra con `prom-client` en Express. |
| **Logtail / Papertrail** | Centralización de logs. |

### Métricas principales

- **Uptime del backend** (PM2 `pm2 status`).
- **Latencia media de respuesta** de `/api/*`.
- **Tasa de errores 5xx** en Nginx.
- **Tamaño de la base de datos** (`SELECT table_schema, SUM(data_length+index_length)/1024/1024 FROM information_schema.tables WHERE table_schema='codeatlas' GROUP BY table_schema;`).
- **Consumo de cuota Gemini** (panel de Google AI Studio).

### Alertas configuradas

- v1.0 no trae alertas integradas. Configurar manualmente en la herramienta elegida (ej. ping HTTP cada 5 minutos con notificación por email/Slack).

---

\pagebreak

# 10. Resolución de problemas

## 10.1. Problemas comunes

### El backend no arranca: «Error: connect ECONNREFUSED 127.0.0.1:3306»

**Causa:** MySQL no está activo o la configuración de `DB_*` es incorrecta.
**Diagnóstico:**

```bash
systemctl status mysql
mysql -u $DB_USER -p$DB_PASSWORD -h $DB_HOST -P $DB_PORT $DB_NAME -e "SELECT 1;"
```

**Solución:** arrancar MySQL (`systemctl start mysql`) o corregir las variables en `.env`.

### Todas las peticiones a `/api/*` devuelven 401

**Causa:** el frontend no incluye el JWT en la cabecera.
**Diagnóstico:** abrir DevTools → Network → verificar que la petición lleva `Authorization: Bearer ...`.
**Solución:** comprobar que `localStorage` contiene la clave `codeatlas:auth`. Si está vacía, volver a iniciar sesión.

### El bot devuelve «GEMINI_API_KEY no está definida»

**Causa:** falta la variable en `.env`.
**Solución:** generar una API key en `https://aistudio.google.com/apikey`, ponerla en `aplicacion/backend/.env` y reiniciar el backend.

### Error 400 «[archivo.md] frontmatter no válido»

**Causa:** el archivo `.md` subido carece del bloque `---` inicial o tiene un campo obligatorio mal formado.
**Solución:** abrir el archivo, verificar el frontmatter contra `aplicacion/ia-doc/formatos/<tipo>.md`. Si la duda persiste, regenerarlo con el Asistente IA.

### El frontend muestra «Token inválido o expirado»

**Causa:** el JWT ha caducado (más de 7 días desde el login).
**Solución:** cerrar sesión y volver a entrar.

### Subida de archivos grandes falla en producción

**Causa:** `client_max_body_size` por defecto de Nginx es 1 MB.
**Solución:** añadir `client_max_body_size 25M;` al bloque `location /api/`.

### CORS bloquea las peticiones desde un dominio distinto

**Causa:** el CORS por defecto es `*`, pero algún navegador o configuración intermedia restringe credentials.
**Solución:** ajustar `cors({ origin: 'https://tu-dominio.com', credentials: true })` en `app.js`.

### El parser ignora un archivo sin avisar

**Causa:** los archivos `.md` sin frontmatter YAML (`---`) se descartan silenciosamente por diseño.
**Solución:** añadir el bloque de frontmatter al archivo.

### Tras `git pull` con cambios en `schema.sql`, faltan columnas en BD

**Causa:** `CREATE TABLE IF NOT EXISTS` no migra tablas preexistentes.
**Solución:** ejecutar a mano las sentencias `ALTER TABLE` documentadas al final de `schema.sql`.

### Lentitud al cargar el listado de diagramas

**Causa:** falta de índices o muchos diagramas históricos.
**Diagnóstico:** `EXPLAIN SELECT ... FROM diagrams WHERE user_id = ...`.
**Solución:** los índices `idx_diagrams_user_id` e `idx_diagrams_project_id` ya están definidos. Si la BD se creó antes de la migración, aplicarla manualmente.

### Procedimientos de diagnóstico

#### Comprobar estado general

```bash
# Backend
pm2 status
pm2 logs codeatlas-api --lines 100

# MySQL
systemctl status mysql
mysql -u root -p -e "SHOW PROCESSLIST;"

# Nginx
nginx -t
systemctl status nginx
tail -f /var/log/nginx/error.log

# Health check manual
curl -i http://localhost:3000/api/auth/login -X POST \
  -H "Content-Type: application/json" \
  -d '{"email":"test","password":"test"}'
# Debe devolver 400 o 401 (no 5xx ni timeout).
```

#### Reiniciar todo en orden

```bash
pm2 restart codeatlas-api
systemctl reload nginx
```

## 10.2. Soporte

### Contactos de soporte

| Nivel | Contacto |
|---|---|
| Soporte primario | izanmg2706@gmail.com |
| Tutor académico (incidencias críticas durante la evaluación) | *(según asignación del centro)* |

### Procedimientos de escalado

Al ser un proyecto académico individual no hay escalado formal. Para incidencias en producción:

1. Recoger logs (`pm2 logs codeatlas-api --lines 200`).
2. Reproducir el problema.
3. Adjuntar todo en un email al contacto primario con asunto `[CodeAtlas][CRÍTICO]`.

### Recursos adicionales

- Documentación interna en `aplicacion/docs/` y `aplicacion/ia-doc/`.
- Carpeta `estructura-proyecto/` para entender las decisiones de diseño.
- Manual de usuario (`Manual de Usuario - CodeAtlas.md`) — útil para reproducir flujos del usuario final.

---

\pagebreak

# 11. Anexos

## 11.1. Glosario de términos

| Término | Definición |
|---|---|
| **API REST** | Estilo arquitectónico para APIs basado en HTTP + recursos. |
| **app-doc/** | Carpeta convencional con el formato de documentación esperado por CodeAtlas. |
| **bcrypt** | Algoritmo de hashing de contraseñas con sal incorporada. |
| **CASCADE** | Política de FK que borra los hijos al borrar el padre. |
| **CORS** | Cross-Origin Resource Sharing. |
| **DBML** | Lenguaje para describir tablas/relaciones de BD. |
| **DDL** | Data Definition Language (CREATE, ALTER, DROP...). |
| **Deep Dive** | Vista interna de un módulo. |
| **ESM** | ECMAScript Modules (`import` / `export`). |
| **Frontmatter** | Bloque YAML al inicio de un `.md` delimitado por `---`. |
| **HMR** | Hot Module Replacement, recarga incremental en desarrollo. |
| **JWT** | JSON Web Token. |
| **LONGTEXT** | Tipo de MySQL hasta 4 GiB. Se usa para `model_json` y `layout_json`. |
| **multer** | Middleware de Express para subida de archivos. |
| **PM2** | Gestor de procesos Node.js para producción. |
| **Pinia** | Librería de gestión de estado para Vue 3. |
| **Pipeline (parser)** | Cadena de transformaciones del parser. |
| **Repository pattern** | Capa que aísla acceso a datos. |
| **Reverse proxy** | Servidor (Nginx) que enruta peticiones a procesos backend. |
| **SPA** | Single Page Application. |
| **Vue Flow** | Librería de canvas de nodos y aristas para Vue 3. |
| **Vite** | Bundler y servidor de desarrollo moderno. |
| **YAML** | Lenguaje de serialización legible. |

## 11.2. Referencias técnicas

- [Vue 3 Documentation](https://vuejs.org/)
- [Vite](https://vitejs.dev/)
- [Pinia](https://pinia.vuejs.org/)
- [Vue Router](https://router.vuejs.org/)
- [Vue Flow](https://vueflow.dev/)
- [Express](https://expressjs.com/)
- [MySQL 8.0 Reference Manual](https://dev.mysql.com/doc/refman/8.0/en/)
- [bcrypt — IETF RFC 7914 (Scrypt) y análisis OWASP](https://owasp.org/www-project-cheat-sheets/cheatsheets/Password_Storage_Cheat_Sheet.html)
- [JWT (RFC 7519)](https://datatracker.ietf.org/doc/html/rfc7519)
- [Google AI Studio — Gemini API](https://ai.google.dev/)
- [DBML](https://dbml.dbdiagram.io/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Lucide Icons](https://lucide.dev/)

## 11.3. Documentación adicional

| Documento | Ubicación |
|---|---|
| Manual de Usuario | `documentos-clase/Manual de Usuario - CodeAtlas.md` |
| Memoria del proyecto | `documentos-clase/memora-del-projecte.txt` (estructura) |
| Diseño previo por bloques | `estructura-proyecto/` |
| Guía de la IA (system prompt) | `aplicacion/ia-doc/GUIA-IA.md` |
| Formatos `app-doc/` detallados | `aplicacion/ia-doc/formatos/*.md` |
| Tasks de desarrollo (histórico) | `aplicacion/docs/tasks/done/` |

## 11.4. Diagramas complementarios

### Flujo de petición autenticada

```
Cliente (browser)
  │
  │ 1. Vue carga la app y lee codeatlas:auth de localStorage
  │
  │ 2. lib/http.js añade Authorization: Bearer <token>
  │
  ▼
Nginx (reverse proxy + TLS)
  │
  │ 3. Reenvía al backend interno por proxy_pass http://127.0.0.1:3000
  │
  ▼
Express (app.js)
  │
  │ 4. CORS + json parser
  │
  ▼
Router del módulo (ej. /api/diagrams)
  │
  │ 5. requireAuth → verifica JWT → set req.userId
  │
  ▼
Controller
  │
  │ 6. Lee req.params / req.body / req.files y llama al service
  │
  ▼
Service (lógica de negocio)
  │
  │ 7. Aplica reglas (verifyProjectAccess, parseDocumentation, ...)
  │
  ▼
Repository (consultas SQL parametrizadas)
  │
  │ 8. mysql2/promise sobre el pool
  │
  ▼
MySQL 8 (CodeAtlas DB)
```

### Pipeline del parser

```
.md subidos por el usuario
   │
   ▼
sortFiles                  ← reordena por dependencia (índice → módulos → BD → pantallas → flujos → reglas)
   │
   ▼
extractFromMarkdown        ← separa frontmatter YAML y secciones ## de cada archivo
   │
   ▼
parseYaml + validate       ← convierte YAML a objeto y valida contra el schema por tipo
   │
   ▼
buildModel                 ← ensambla el JSON unificado (modules, screens, database, flows, systemRules)
   │
   ▼
resolveReferences          ← chequea referencias cruzadas (depends-on, screens, modules en flows...)
   │
   ▼
calculateLayout            ← asigna coordenadas iniciales (auto-layout)
   │
   ▼
saveModel                  ← persiste { model, layout } en la tabla `diagrams`
```

### Sesión del bot

```
Usuario abre /bot
   │
   ▼
GET /api/bot/sessions               ← lista de sesiones del usuario
   │
   ▼ (si no hay ninguna)
POST /api/bot/sessions               ← crear sesión vacía
   │
   ▼
GET /api/bot/sessions/:id            ← cargar history + files
   │
   ▼
POST /api/bot/sessions/:id/message   ← cada mensaje del usuario
   │   ▶ bot.service: appendHistory
   │   ▶ bot.gemini: cargar GUIA-IA.md + estado de sesión → llamar a Gemini
   │   ▶ Gemini devuelve { reply, files: [{ path, content }] }
   │   ▶ bot.validator: comprueba el formato
   │   ▶ bot.repository: persistir reply en history + files en bot_files
   │
   ▼
GET /api/bot/sessions/:id/zip        ← cuando el usuario quiere descargar
   │   ▶ bot.zip: empaqueta con jszip y envía application/zip
   ▼
```

---

\pagebreak

# Contraportada

**CodeAtlas — Manual Técnico**

*Documentación técnica del sistema, su arquitectura, instalación y mantenimiento.*

**Versión del manual:** 1.0 · **Fecha:** 19 de mayo de 2026

Este manual forma parte del **Proyecto de Síntesis del CFGS Desarrollo de Aplicaciones Web (DAW)** del curso 2025-2026.

Para sugerencias, erratas o ampliaciones técnicas, contactar con el autor en:

**izanmg2706@gmail.com**

© 2026 · CodeAtlas · Todos los derechos reservados al autor del proyecto académico.
