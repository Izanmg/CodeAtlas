# Guion de la presentación — CodeAtlas

> **Proyecto de Síntesis DAW · Izan Mendoza**
> Duración total: **20 minutos** → **15 min de explicación + 5 min de demostración en vivo**.
> Filosofía del deck: **poca letra, muchas imágenes**. El texto de cada diapositiva es un apoyo visual; lo importante lo cuentas tú al hablar.

---

## Cómo usar este documento

Para cada diapositiva tienes tres bloques:

- **En pantalla** → lo que el público VE (imágenes a poner, texto mínimo). No metas párrafos: solo títulos cortos, palabras clave o capturas.
- **Qué explicar** → tu guion hablado (lo que dices tú; el público no lo lee).
- **⏱** → tiempo aproximado para que la suma cuadre en 15 minutos.

**Reparto del tiempo (15 min de explicación):**

| Bloque | Diapositivas | Tiempo |
|---|---|---|
| Introducción y la idea | 1–4 | ~4:15 |
| Qué hace y cómo está hecho | 5–8 | ~5:00 |
| El corazón: formato `.md` + parser | 9–10 | ~3:15 |
| IA, seguridad y producción | 11–12 | ~2:30 |
| Cierre | 13 | ~1:00 |
| **Total** | **13 slides** | **~16:00** |

> Estimación ~1 min por encima de los 15. El recorte más fácil es **la galería de ejemplos de la diapo 9** (pásala rápida → ~0:45 menos) y apretar un poco la de base de datos (diapo 8). En vivo se suele ir más rápido, así que con ensayar una vez deberías cuadrar.

Después → **5 min de demo en vivo** (guion al final de este documento).

---

## Diapositiva 1 — Portada

**En pantalla:**
- Logo de CodeAtlas (`logo-full.png`) grande y centrado.
- Subtítulo de una línea: *"Convierte el código en un mapa que cualquiera entiende"*.
- Tu nombre + Proyecto de Síntesis DAW + fecha.

**Qué explicar:**
- Saludo breve y presentación. "Hoy os presento CodeAtlas, una herramienta que transforma la documentación de una aplicación en un diagrama visual e interactivo."
- Adelanta el formato: ~15 min explicando la idea y cómo está construida, y al final una demo en vivo.

**⏱ 0:30**

---

## Diapositiva 2 — El problema

**En pantalla:**
- Imagen impactante: una pantalla llena de código / un repositorio enorme con muchas carpetas (algo que dé sensación de "abrumador").
- Una sola frase grande: *"Entender una app nueva = leer miles de líneas de código"*.
- Debajo, en pequeño, tres iconos sueltos y desconectados: esquema de BD · diagrama de casos de uso · flujos → con un símbolo de "desactualizado" encima.

**Qué explicar:**
- El problema real: cuando entras nuevo en una empresa o en un proyecto, lo más lento es entender CÓMO está montada la aplicación. Te pasas días leyendo código para hacerte un mapa mental.
- Pero ojo: **no se trata solo de evitar leer código** — para eso ya existen formatos para representar la app de forma gráfica. El problema de verdad es **mantenerlos**:
  - Cada diagrama (esquema de base de datos, casos de uso, flujos de trabajo…) lo tienes que **actualizar por separado** y a mano. Es tedioso y se te olvida.
  - En cuanto el código cambia, esos diagramas **quedan desactualizados** y dejan de ser fiables.
  - Además están **dispersos** en herramientas distintas: el esquema de BD en una, los casos de uso en otra, los flujos en otra.
- CodeAtlas ataca justo eso: **un único origen de verdad** del que salen todos los diagramas, así no pierdes tiempo actualizándolos, **siempre están sincronizados** y todo queda **centralizado en una sola herramienta** — esquema de base de datos, diagrama de casos de uso, flujos de trabajo, módulos…

**⏱ 1:15**

---

## Diapositiva 3 — De dónde viene la idea

**En pantalla:**
- A la izquierda: icono de IA / cerebro. A la derecha: un diagrama limpio de cajas y flechas.
- Flecha en el centro: **Código → (IA) → Esquema visual**.
- Texto mínimo: *"La IA es buenísima traduciendo lenguaje humano ↔ lenguaje máquina"*.

**Qué explicar:**
- Con el auge de la IA noté que falta una herramienta que **gestione y explique** las aplicaciones aprovechando esa capacidad.
- La IA es muy buena traduciendo: puede analizar una aplicación y transformarla a un formato muy concreto que luego una herramienta pueda leer para representar la app.
- De ahí nace CodeAtlas: una herramienta que **transforma tu aplicación en un esquema visual con módulos, pantallas, base de datos y flujos**, para que se entienda todo sin leer código.
- Caso de uso estrella: que un trabajador nuevo entienda la app en minutos en vez de días.
- Pero no es solo para entender la app **entera de golpe**: también sirve en el **día a día**. Antes de tocar el código para una actualización, el programador puede mirar en el diagrama **cómo funcionan justo los archivos que va a modificar** y cómo se conectan con el resto.
- Así sigue **el mismo patrón y el mismo formato** que ya hay en el proyecto, en vez de meter código que rompe la estructura, poco optimizado o costoso de mantener. Mantiene la coherencia de la aplicación a largo plazo.

**⏱ 1:30**

---

## Diapositiva 4 — La visión a futuro

**En pantalla:**
- Captura/logo de un agente de IA de programación (p. ej. Claude Code) en un lado.
- Un mismo paso que produce **dos salidas a la vez**: una flecha que sale hacia **código** y otra hacia **documentación (`.md`)**, y de la doc → el diagrama de CodeAtlas.
- Texto mínimo: *"Programas como ahora; la documentación se actualiza sola"*.

**Qué explicar:**
- Hoy ya programamos con agentes de IA (como **Claude Code**): para hacer una actualización, defines bien la idea, haces un **paso a paso** de lo que quieres y le pides a la IA que lo implemente.
- La clave de la visión es esta: no hace falta pedírselo cada vez. La idea es crear un **skill** (una instrucción permanente para el agente) que haga que **cada vez que escriba código, genere y actualice automáticamente la documentación** en el formato de CodeAtlas. El programador se olvida por completo de la doc.
- Así, **sin esfuerzo extra ni tiempo dedicado a documentar**, la documentación de la app —y por tanto el diagrama— queda **siempre actualizada en tiempo real**, a la vez que el código. Se acaba el "ya documentaré luego" que nunca llega.
- CodeAtlas es el primer paso de esa visión: hoy ya lee ese formato y lo dibuja, e incluso integra una IA que genera ese formato por ti (lo veréis luego).

**⏱ 1:00**

---

## Diapositiva 5 — ¿Qué hace CodeAtlas? (la idea en 10 segundos)

**En pantalla:**
- Diagrama simple del flujo central: **Carpeta de `.md`  →  CodeAtlas  →  Diagrama interactivo**.
- Captura real de un diagrama generado (el canvas con cajas de colores).

**Qué explicar:**
- En una frase: subes una carpeta de archivos `.md` con un formato concreto y CodeAtlas te genera un diagrama interactivo de toda la arquitectura.
- En ese diagrama ves los **módulos** (backend y frontend), las **pantallas**, las **tablas de base de datos** y los **flujos** de la app, y cómo se conectan entre sí.
- No es una imagen estática: puedes mover nodos, filtrar, hacer clic para ver detalles y recorrer flujos paso a paso.

**⏱ 1:00**

---

## Diapositiva 6 — Lenguajes y tecnologías (y por qué)

**En pantalla:**
- Dos columnas con logos:
  - **Frontend:** Vue 3, Vite, Pinia, Vue Router, Vue Flow.
  - **Backend:** Node.js, Express, MySQL.
- Texto clave destacado: *"Un solo lenguaje: JavaScript de punta a punta"*.

**Qué explicar:**
- La razón principal de la elección es práctica: **son las tecnologías que mejor conozco**, lo que me ha permitido centrarme en el problema y no en pelearme con el lenguaje.
- **JavaScript en todo el stack** (Vue delante, Node detrás): un único lenguaje, menos cambio de contexto, comparto lógica y mentalidad entre front y back.
- **Vue 3 + Vite**: framework moderno, reactivo y con arranque muy rápido en desarrollo. **Pinia** para el estado global y **Vue Router** para la navegación.
- **Vue Flow**: librería específica para el canvas de nodos y conexiones; me dio el lienzo interactivo sin reinventarlo.
- **Node.js + Express**: API REST ligera y modular. **MySQL** como base de datos relacional.

**⏱ 1:00**

---

## Diapositiva 7 — Estructura del proyecto (arquitectura modular)

**En pantalla:**
- Dos árboles de carpetas lado a lado (texto monospace, cortito):

  **Backend** (Express)
  ```
  src/modules/
    auth/
      auth.routes.js
      auth.controller.js
      auth.service.js
      auth.repository.js
      auth.middleware.js
    projects/  diagrams/
    parser/    settings/  bot/
  ```
  **Frontend** (Vue)
  ```
  src/modules/
    auth/
      views/      (pantallas)
      components/  (piezas UI)
      services/    (llamadas API)
      stores/      (estado Pinia)
    dashboard/  projects/
    diagrams/   settings/  bot/
  ```
- Texto mínimo: *"Cada módulo = su carpeta · mismo patrón en todos"*.

**Qué explicar:**
- La app sigue una **arquitectura modular**: en vez de carpetas por tipo de archivo, cada **área funcional** (auth, proyectos, diagramas, parser, ajustes, asistente IA) tiene **su propia carpeta** con todo lo suyo dentro. Front y back comparten esta filosofía.
- Dentro de cada módulo se repite **siempre el mismo patrón**, así sabes dónde está cada cosa sin buscar:
  - **Backend**: `routes` (define los endpoints) → `controller` (capa HTTP) → `service` (lógica de negocio) → `repository` (acceso a la base de datos). Y `middleware` cuando hace falta (p. ej. comprobar el token).
  - **Frontend**: `views` (las pantallas) → `components` (piezas reutilizables) → `services` (llamadas a la API) → `stores` (estado con Pinia).
- Ventajas: es **fácil de entender, de mantener y de ampliar** — para añadir una funcionalidad nueva, creas una carpeta más siguiendo el mismo molde, sin tocar el resto.
- Front y back están **separados** y se comunican por una **API REST** bajo `/api`; un cliente HTTP central inyecta el token en cada petición.
- *(Guiño meta:)* esta misma estructura modular es justo lo que CodeAtlas dibuja como "módulos" en el diagrama.

**⏱ 1:30**

---

## Diapositiva 8 — Base de datos

**En pantalla:**
- Diagrama entidad-relación con las **6 tablas** y sus relaciones (idealmente una captura del propio diagrama de BD de CodeAtlas):
  - `users` ──1:1── `user_settings`
  - `users` ──1:N── `projects` ──1:N── `diagrams`
  - `users` ──1:N── `diagrams`
  - `users` ──1:N── `bot_sessions` ──1:N── `bot_files`
- Texto mínimo: *"MySQL · 6 tablas relacionadas"*.

**Qué explicar:**
- Base de datos relacional en **MySQL**. Seis tablas:
  - **users** — cuentas (email único, nombre, `password_hash`). El email es la clave de login.
  - **user_settings** — preferencias del usuario (tema claro/oscuro), relación 1 a 1.
  - **projects** — proyectos, que son el contenedor de diagramas; pertenecen a un usuario.
  - **diagrams** — cada diagrama generado; guarda el **modelo** y el **layout** del canvas en JSON, más contadores.
  - **bot_sessions** — cada conversación con el asistente IA, con su historial.
  - **bot_files** — los archivos `.md` que genera el bot dentro de una sesión.
- Detalle de seguridad clave: **todas las consultas filtran por `user_id`**, así un usuario nunca puede ver datos de otro. Borrados en cascada para mantener la integridad.

**⏱ 1:30**

---

## Diapositiva 9 — El corazón: el formato `.md` que interpreta

**En pantalla:** *(diapositiva densa a propósito — que el público VEA el formato; tú lo cuentas por encima)*

- **(1) La carpeta** `app-doc/` y sus tipos de archivo, con una línea de qué describe cada uno:
  ```
  app-doc/
  ├── 01-modules.md        → índice: lista todos los módulos del proyecto
  ├── modules/backend/*    → un módulo de backend (rol, endpoints, archivos)
  ├── modules/frontend/*   → un módulo de frontend (pantallas, estado)
  ├── screens/*            → una pantalla (qué muestra, acciones)
  ├── flows/*              → un flujo (pasos que cruzan capas)
  ├── database/*           → una tabla de la BD (en formato DBML)
  └── 05-system-rules.md   → reglas globales del sistema
  ```

- **(2) El esquema de un archivo** = `frontmatter` (metadatos, entre `---`) + `secciones` (`## ...`). Texto mínimo: *"Frontmatter = conexiones (IDs) · Secciones = contenido del nodo"*.

- **(3) Galería de ejemplos reales** — muestra el contenido de varios archivos para que se entienda la interpretación (pásalos rápido, explícalos por encima):

  **a) Índice de módulos** (`01-modules.md`) — define qué módulos existen:
  ```
  ---
  type: modules-index
  backend:  [auth-backend, projects-backend, diagrams-backend, parser-backend, ...]
  frontend: [auth-frontend, dashboard-frontend, diagrams-frontend, ...]
  ---
  ## Overview
  CodeAtlas se organiza en módulos por responsabilidad funcional...
  ```

  **b) Módulo de backend** (`modules/backend/auth-backend-modules.md`):
  ```
  ---
  type: module
  layer: backend
  id: auth-backend            ← su identificador único
  name: Autenticación
  database: [users]           ← ▶ flecha hacia la tabla users
  api: [POST /auth/login, POST /auth/register, GET /auth/me]
  depends-on: []              ← ▶ flechas hacia otros módulos
  ---
  ## Purpose
  Gestiona identidad, sesiones y control de acceso.
  ## Functions
  - login(email, password)
  - validateSession(token)
  ```

  **c) Módulo de frontend** (`modules/frontend/auth-frontend-modules.md`):
  ```
  ---
  type: module
  layer: frontend
  id: auth-frontend
  name: Pantallas de autenticación
  screens: [login, register]      ← ▶ flechas hacia pantallas
  consumes-api: [auth-backend]    ← ▶ flecha hacia el módulo de backend
  depends-on: []
  ---
  ## Purpose
  Cubre el login y registro y el estado de sesión.
  ## State
  - currentUser
  - isAuthenticated
  ```

  **d) Pantalla** (`screens/login-screens.md`):
  ```
  ---
  type: screen
  id: login
  name: Login
  module: auth-frontend     ← ▶ pertenece a este módulo
  requires-auth: false
  ---
  ## Description
  Punto de entrada para usuarios no autenticados.
  ## Elements
  - input email
  - input contraseña
  ## Actions
  - submit-login
  - ir-a-registro
  ```

  **e) Tabla de base de datos** (`database/users-database.md`) — en formato DBML:
  ```
  ---
  type: entity
  id: users
  name: User
  relations:                ← ▶ relaciones entre tablas
    - { target: projects, type: one-to-many, field: user_id }
  ---
  ## Table
  ```dbml
  Table users {
    id uuid [pk]
    email varchar [not null, unique]
    name varchar [not null]
    password_hash varchar [not null]
  }
  Ref: users.id < projects.user_id
  ```
  ```

  **f) Reglas del sistema** (`05-system-rules.md`) — secciones libres:
  ```
  ---
  type: system-rules
  ---
  ## Auth
  - Todas las rutas /api requieren token salvo login y register
  ## Validation
  - La contraseña debe tener al menos 8 caracteres
  ```

  **g) Flujo** (`flows/user-login-flows.md`) — el más especial: una **secuencia de pasos** que cruza las capas. Cada paso lleva un prefijo `[capa:módulo/archivo/función]` → se dibuja como un **recorrido** sobre el diagrama:
  ```
  ---
  type: flow
  id: user-login
  name: Login de usuario
  ---
  ## Steps
  - [screen:login]                          El usuario rellena el formulario
  - [frontend:auth-frontend/LoginView.vue]  Se valida y se llama a POST /auth/login
  - [backend:auth-backend/auth.controller.js/login]  Se comprueban las credenciales
  - [database:users]                        Se consulta el usuario en la BD
  - [screen:dashboard]                      Se guarda el token y se redirige
  ```
  *(En el "modo Flujos" del canvas, este flujo se ilumina paso a paso: pantalla → frontend → backend → base de datos.)*

**Qué explicar:**
- Esta es la pieza central. CodeAtlas no adivina: lee archivos `.md` con un **formato muy concreto**, y conviene que veáis cómo es porque ahí está la clave de cómo se interpreta el diagrama.
- La documentación es **una carpeta `app-doc/`** con **siete tipos de archivo**: el índice de módulos, módulos de backend, módulos de frontend, pantallas, flujos, tablas de base de datos y las reglas del sistema. **Cada archivo describe una pieza** de la app y se convierte en un **nodo** del diagrama.
- Cada archivo tiene dos partes:
  - **El frontmatter** (arriba, entre `---`): los **metadatos** y, sobre todo, las **referencias** a otros elementos por su **ID**. Aquí, `database: [users]` y `depends-on: [...]` le dicen al parser con qué conectar este nodo → **eso se convierte en las flechas del diagrama**.
  - **Las secciones** (`## Purpose`, `## Functions`…): el **contenido** que se muestra cuando haces clic en el nodo (su propósito, sus funciones, etc.).
- La magia está en los **IDs**: cada elemento tiene un identificador único y los demás archivos lo referencian por ese ID. Así el parser sabe que "la pantalla de login pertenece al módulo de auth" o que "este módulo usa la tabla users", y dibuja esas conexiones automáticamente.
- El caso más especial es el **flujo** (ejemplo g): no es una conexión fija, sino una **secuencia de pasos** que cruza las capas. Cada paso lleva un prefijo `[capa:...]` y el parser lo convierte en un **recorrido** que en el canvas se ilumina paso a paso — así ves "qué pasa cuando el usuario hace X" sin leer código.
- *(Pasa la galería de ejemplos ágil, sin leerlos enteros: el objetivo es que vean la pinta del formato, no memorizarlo.)*

**⏱ 2:15**

---

## Diapositiva 10 — Cómo se transforma: el pipeline del parser

**En pantalla:**
- Cadena de cajas (pipeline): **`.md` → extraer frontmatter+secciones → validar → construir modelo → resolver referencias → calcular layout → JSON del diagrama**.
- Texto mínimo: *"De texto a diagrama en 6 pasos"*.

**Qué explicar:**
- Cuando subes los archivos, el backend ejecuta un **pipeline lineal**, cada paso aislado en su pieza:
  1. **Extrae** el frontmatter y las secciones de cada `.md`.
  2. **Valida** que el formato y los campos obligatorios estén bien (si algo falla, te avisa con el archivo concreto).
  3. **Construye el modelo** unificado: módulos, pantallas, flujos, tablas y reglas.
  4. **Resuelve referencias**: comprueba que los IDs apunten a elementos que existen.
  5. **Calcula el layout** inicial: coloca cada nodo en columnas (BD, backend, frontend, pantallas).
- El resultado es un **JSON** que el frontend dibuja con Vue Flow. Ese modelo y la posición de los nodos se guardan en la tabla `diagrams`, así al volver a abrirlo lo recuperas tal cual lo dejaste.

**⏱ 1:00**

---

## Diapositiva 11 — Integración de IA: el asistente

**En pantalla:**
- Captura del asistente (las 3 columnas: sesiones · chat · árbol de archivos generados).
- Logo de Google Gemini.
- Texto mínimo: *"Le describes tu app en lenguaje natural → te genera la carpeta `app-doc/`"*.

**Qué explicar:**
- CodeAtlas integra **Google Gemini** para cerrar el círculo: en vez de escribir el formato a mano, **se lo describes a la IA en lenguaje natural** y ella genera los `.md` con el formato correcto.
- El asistente conversa contigo, mantiene el **historial por sesión**, valida los archivos que genera (que el formato sea correcto antes de guardarlos) y te los deja descargar como un **.zip** listo para subir y generar el diagrama.
- Puedes elegir entre dos modelos de Gemini según velocidad/cuota, y si se agota la cuota la app te ofrece cambiar de modelo automáticamente.
- La API key vive solo en el servidor, nunca se expone al cliente. Esto cubre el **requisito del ciclo de integrar un modelo de IA** — y conecta con la visión del principio: la IA produce el formato, CodeAtlas lo dibuja.

**⏱ 1:30**

---

## Diapositiva 12 — Seguridad y despliegue en producción

**En pantalla:**
- Dos columnas con iconos.
  - **Seguridad:** JWT · contraseñas con bcrypt · consultas siempre por `user_id` · validación de entradas.
  - **Producción:** Docker · Kubernetes · HTTPS · URL pública.
- Texto mínimo: *"Desplegada y accesible online"*.

**Qué explicar:**
- **Seguridad**: autenticación con **JWT** (token firmado que caduca), contraseñas **hasheadas con bcrypt** (nunca en texto plano), y como defensa en profundidad **toda consulta filtra por usuario**. Las entradas se validan y se usan consultas parametrizadas para evitar inyección SQL.
- **Despliegue**: la app está **en producción de verdad**, contenerizada con Docker y desplegada en **Kubernetes**, con HTTPS y URL pública. Cumple el requisito del ciclo de tener la app desplegada (sin FTP, con HTTPS).

**⏱ 1:00**

---

## Diapositiva 13 — Cierre y próximos pasos

**En pantalla:**
- Logo de CodeAtlas.
- Tres bullets cortos de futuro: *"Analizar apps ya existentes automáticamente"* · *"Generar código alineado con el diagrama"* · *"Colaboración en equipo"*.
- Texto grande: *"¿Pasamos a la demo?"*

**Qué explicar:**
- Recap en una frase: CodeAtlas convierte la documentación de una app en un mapa visual e interactivo, con una IA que genera ese formato por ti.
- Próximos pasos: el `application-diagram` (analizar una app ya construida directamente desde su código), generar código alineado con el diagrama, y trabajo colaborativo.
- Cierre: "Y ahora, en lugar de seguir contándolo, os lo enseño funcionando." → pasar a la demo.

**⏱ 1:00**

---

# Demo en vivo (5 minutos)

> Objetivo: enseñar el ciclo completo funcionando. Ten todo preparado ANTES (sesión iniciada, un proyecto creado, y unos `.md` de ejemplo a mano). No improvises rutas en vivo.

**Guion sugerido (ritmo ágil, ~5 min):**

1. **Login** (15 s) — entra rápido (ten las credenciales escritas o autocompletadas).
2. **Dashboard** (20 s) — enseña tus proyectos y los diagramas recientes.
3. **El asistente IA** (1:30) — abre el asistente, escribe una descripción corta de una app sencilla y enseña cómo genera los `.md` en el árbol de la derecha. Descarga el zip. *(Si la cuota o el tiempo aprietan, ten ya unos `.md` generados de antes como plan B.)*
4. **Generar el diagrama** (1:00) — crea un diagrama nuevo, sube los `.md`, enseña el progreso por fases hasta que se abre el canvas.
5. **El canvas** (1:30) — lo más visual y lo que más impresiona:
   - Mueve un par de nodos y enseña el **undo/redo** y el **Guardar**.
   - Cambia a **modo Flujos**, elige un flujo y enseña cómo se ilumina el recorrido paso a paso.
   - Haz clic en un nodo para abrir el **panel de detalle**.
   - Usa los **filtros por capa** en modo Relaciones.
6. **Cierre** (15 s) — vuelve al dashboard. "Esto es CodeAtlas. Gracias, ¿alguna pregunta?"

**Plan B (si falla internet / la IA):** ten un diagrama ya generado y guardado en un proyecto. Si la generación con IA falla en vivo, saltas directamente al paso 5 (el canvas) que es lo más vistoso y no depende de la red.

---

## Consejos finales

- **Menos texto en pantalla, más en tu voz.** Si una diapositiva tiene un párrafo, recórtalo a 4 palabras.
- **Una imagen por idea.** Capturas reales de tu app > diagramas genéricos de internet.
- **Ensaya con cronómetro.** 15 min se pasan rápido; si te pasas, recorta de la galería de ejemplos de la diapo 9 y aprieta la diapo 8 (base de datos).
- **Prepara la demo dos veces antes.** El 80% de los fallos en demos son por no tener el estado listo.
- **Ten respuestas pensadas** para: "¿por qué no analizas el código directamente?" (respuesta: es la ampliación futura `application-diagram`; el MVP parte de documentación estructurada porque garantiza un resultado fiable y es donde la IA encaja hoy).
