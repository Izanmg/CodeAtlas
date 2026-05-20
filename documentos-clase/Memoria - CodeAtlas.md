# Memoria del Proyecto

# **CodeAtlas**

### *Plataforma web para la visualización modular de arquitecturas de aplicaciones a partir de documentación Markdown, con generación asistida por IA.*

---

\pagebreak

# 1. Elementos preliminares

## 1.1. Portada

| Campo | Valor |
|---|---|
| **Título del proyecto** | CodeAtlas — Visualización de arquitecturas de aplicaciones a partir de documentación Markdown |
| **Autor** | Izan Mendoza Garcia |
| **Contacto** | izan.mendoza22@lacetania.cat |
| **Centro** | Institut Lacetània (DAW) |
| **Fecha de entrega** | 22 de mayo de 2026 |
| **Fecha del documento** | 19 de mayo de 2026 |
| **Versión** | 1.0 (final) |

---

\pagebreak

## 1.2. Resumen ejecutivo

**CodeAtlas** es una aplicación web modular que transforma documentación escrita en formato Markdown
en diagramas visuales navegables de la arquitectura de una aplicación. Está dirigida a estudiantes y
profesionales del desarrollo que necesitan comunicar la estructura interna de sus proyectos sin
invertir horas en construir diagramas a mano.

El usuario describe su aplicación en archivos `.md` con un formato estructurado y reproducible, y
CodeAtlas le devuelve un diagrama interactivo con módulos de backend y frontend, entidades de base
de datos, pantallas y flujos, todo conectado por las dependencias declaradas. Incluye una vista
detallada de cada módulo (**deep dive**) que muestra carpetas, archivos y funciones internas con
descripciones expandibles.

Como parte del proyecto se ha integrado un **asistente conversacional con IA** (Google Gemini) que
permite generar la documentación del formato CodeAtlas a partir de una descripción en lenguaje
natural. El usuario conversa con el bot, este genera los archivos `.md` correctamente formateados,
los persiste y los entrega como un `.zip` listo para subir al generador de diagramas. Cubre el
requisito obligatorio del ciclo de integración de IA y elimina la barrera de entrada al formato.

### Objetivos principales

1. Construir una aplicación web full-stack con frontend (Vue 3) y backend (Node.js + Express)
   separados, comunicados por API REST.
2. Definir un formato de documentación basado en Markdown + YAML que pueda transformarse de forma
   determinista en un modelo visual.
3. Implementar un parser robusto con validación, resolución de referencias cruzadas y cálculo
   automático de layout.
4. Persistir usuarios, proyectos, diagramas y sesiones del asistente IA en MySQL con autenticación
   JWT.
5. Integrar un modelo de IA (Google Gemini) para asistir al usuario en la creación de la
   documentación.
6. Desplegar la aplicación en producción sobre Kubernetes (infla.cat) cumpliendo los requisitos del
   ciclo.

### Resultados clave conseguidos

- Aplicación web funcional, desplegada y accesible vía HTTPS.
- Stack moderno: Vue 3 + Vite + Pinia (frontend), Node.js + Express + MySQL2 (backend), MySQL 8
  (base de datos).
- Base de datos relacional con 6 tablas correctamente relacionadas y autenticación mediante JWT.
- Parser completo del formato CodeAtlas con validación estricta del frontmatter y resolución de
  referencias.
- Vista principal del diagrama con renderizado interactivo (Vue Flow), edición de layout y
  persistencia.
- Vista de **deep dive** que muestra la estructura interna de cada módulo (carpetas, archivos,
  funciones).
- Integración del asistente IA basado en Gemini 2.5 con sesiones múltiples, persistencia y descarga
  de la documentación generada como `.zip`.
- Documentación completa: manual técnico, manual de usuario y la presente memoria.

---

\pagebreak

## 1.3. Índice

1. **Elementos preliminares**
   - 1.1. Portada
   - 1.2. Resumen ejecutivo
   - 1.3. Índice
2. **Cuerpo principal**
   - 2.1. Introducción
   - 2.2. Planificación
   - 2.3. Desarrollo del proyecto
   - 2.4. Evaluación y resultados
3. **Elementos finales**
   - 3.1. Conclusiones
   - 3.2. Referencias y bibliografía
   - 3.3. Anexos

---

\pagebreak

# 2. Cuerpo principal

## 2.1. Introducción

### Contexto del proyecto

Documentar la arquitectura de una aplicación es una tarea repetitiva, propensa a errores y casi
siempre desactualizada respecto al código real. Las herramientas existentes para crear diagramas
(Lucidchart, Draw.io, Excalidraw) son potentes pero exigen que el usuario coloque cada nodo a mano,
lo que convierte cualquier cambio menor en un trabajo manual costoso. Generadores automáticos como
PlantUML o C4 modelan estructuras visuales pero requieren aprender un lenguaje específico y rara vez
producen resultados navegables.

CodeAtlas nace como respuesta a esa fricción. En lugar de pedirle al usuario que dibuje el diagrama,
le pide que **describa** la aplicación con un formato textual sencillo (Markdown con un bloque YAML
al inicio), y se encarga de transformar esa descripción en un diagrama visual e interactivo. El
usuario solo trabaja con texto; el diagrama es una consecuencia automática del texto.

### Objetivos detallados

#### Funcionales

- **F1.** Permitir el registro y autenticación de usuarios con email y contraseña.
- **F2.** Permitir al usuario organizar sus diagramas en proyectos.
- **F3.** Aceptar un conjunto de archivos `.md` con un formato predefinido y producir un modelo JSON
  unificado de la arquitectura.
- **F4.** Renderizar ese modelo como un diagrama interactivo (zoom, paneo, selección, edición de
  posiciones).
- **F5.** Persistir cada diagrama (modelo + layout) para que el usuario pueda volver a abrirlo y
  editarlo más tarde.
- **F6.** Permitir profundizar en un módulo concreto y ver su estructura interna (deep dive:
  carpetas, archivos, funciones, imports).
- **F7.** Integrar un modelo de IA que ayude al usuario a generar la documentación a partir de una
  descripción en lenguaje natural.
- **F8.** Producir una **carpeta `app-doc/` descargable como `.zip`** lista para alimentar al
  generador de diagramas.

#### No funcionales

- **NF1.** La aplicación debe estar desplegada en producción con HTTPS y accesible públicamente.
- **NF2.** La autenticación debe ser stateless (JWT) para escalar sin almacenar sesiones en
  servidor.
- **NF3.** La base de datos relacional debe tener al menos 3 tablas correctamente relacionadas.
- **NF4.** El frontend debe ser responsive y validar contra el estándar HTML5.
- **NF5.** El sistema debe ser robusto ante inyección SQL y otros vectores comunes.
- **NF6.** El código debe ser mantenible: separación por módulos, capas (controlador / servicio /
  repositorio) y convenciones consistentes.

### Alcance del proyecto

#### Dentro del alcance (MVP entregable)

- Registro y autenticación de usuarios con email y contraseña.
- Gestión de proyectos por usuario (crear, renombrar, borrar).
- Subida de archivos `.md`, parseo y generación de diagrama persistido.
- Renderizado interactivo del diagrama con edición de layout y persistencia de posiciones.
- Vista detallada de cada módulo (deep dive).
- Asistente IA conversacional para generar la documentación.
- Tema visual claro/oscuro y configuración de perfil.

#### Fuera del alcance (futuras ampliaciones)

- Análisis automático de aplicaciones ya construidas (`application-diagram`): parseo del código
  fuente para generar el modelo sin que el usuario escriba documentación. Queda definido en la
  documentación interna pero no implementado.
- Compartir diagramas con otros usuarios o trabajo colaborativo en tiempo real.
- Exportación a otros formatos (PNG, SVG, PDF) más allá del JSON interno.
- Versionado del diagrama (historial de cambios).

### Metodología utilizada

Se ha aplicado una metodología **iterativa-incremental** con ciclos cortos de 1-3 días, priorizando
entregar un MVP funcional pronto y refinando funcionalidades según el tiempo disponible. Las
decisiones técnicas y arquitectónicas se han documentado en *tasks* dentro del propio repositorio
(`aplicacion/docs/tasks/`) como decisiones reversibles, no como contratos cerrados.

Se ha trabajado con control de versiones Git y commits frecuentes con mensajes descriptivos en
español. Las pruebas se han realizado manualmente con un foco en flujos de usuario reales,
complementadas con scripts puntuales de smoke testing para verificar el backend tras cambios
estructurales.

---

\pagebreak

## 2.2. Planificación

### Plan de trabajo general

El proyecto se concibió en abril de 2026 con una entrega prevista para el 22 de mayo de 2026
(aproximadamente 7 semanas de desarrollo efectivo). Se distribuyó en **cinco fases consecutivas**
con hitos verificables al final de cada una.

### Fases del proyecto

| Fase | Descripción | Periodo aproximado |
|---|---|---|
| **F1. Análisis y diseño** | Definición del formato CodeAtlas, modelo conceptual, prototipo de arquitectura. | Abril 2026 (semanas 1-2) |
| **F2. Backend base** | Express, MySQL, autenticación JWT, CRUD de proyectos. | Inicio mayo 2026 (semana 3) |
| **F3. Parser y diagramas** | Pipeline del parser, persistencia de diagramas, renderizado con Vue Flow. | Mayo 2026 (semanas 4-5) |
| **F4. Deep dive y mejoras UX** | Vista interna de módulos, edición de layout, settings de usuario. | Mayo 2026 (semana 6) |
| **F5. Integración IA y entrega** | Asistente IA (Gemini), descarga zip, documentación final, despliegue. | 12-22 mayo 2026 (semana 7) |

### Cronograma

```
Abr 2026:  [F1] Análisis y diseño
May w1:    [F2] Backend base + autenticación
May w2:    [F3] Parser y persistencia
May w3:    [F3] Renderizado del diagrama
May w4:    [F4] Deep dive + settings
May w5:    [F5] Asistente IA + zip + memoria + despliegue
May 22:    >>> ENTREGA <<<
May 25-27: Exposición
```

El detalle día a día se gestionó con un diagrama de Gantt en ProjectLibre y se exportó a
`gantt-final.md` y `gantt-projectlibre.csv` dentro del repositorio.

### Recursos necesarios

- **Hardware**: ordenador personal con 16 GB RAM, Windows 11.
- **Software de desarrollo**: Node.js 18+, MySQL 8.0, Git, VS Code, ProjectLibre, navegador moderno.
- **Servicios externos**: cuenta de Google AI Studio para la API key de Gemini (free tier), cluster
  Kubernetes del centro (infla.cat) para el despliegue, repositorio Git.
- **Documentación de referencia**: documentación oficial de Vue 3, Express, MySQL, Vue Flow, Google
  Gemini API.

### Plan de trabajo detallado

La planificación detallada se gestionó día a día con tasks dentro del repositorio
(`aplicacion/docs/tasks/` para las pendientes y `aplicacion/docs/tasks/done/` para las completadas).
Cada task documenta:

- **Qué** se va a hacer.
- **Por qué** se decidió así.
- **Cómo** se implementó (cuando ya está completada).
- **Decisiones técnicas reversibles vs cerradas.**

A modo de ejemplo, los tasks completados durante la última semana incluyen:

- `08-05-deep-dive-modulos.md` — vista UML interna de cada módulo.
- `08-05-deep-dive-layout-y-dependencias.md` — cálculo de layout para la vista detallada.
- `08-05-notas-archivos-y-panel.md` — descripciones expandibles en funciones.
- `08-05-rediseno-flujos.md` — visualización mejorada de los flujos.
- `13-05-bot-generador-app-doc.md` — integración completa del asistente IA.

### Hitos alcanzados

| Hito | Fecha | Estado |
|---|---|---|
| Definición del formato CodeAtlas (frontmatter + secciones) | 25-abril-2026 | ✅ |
| Backend con autenticación y CRUD de proyectos | 4-mayo-2026 | ✅ |
| Parser completo con validación y referencias | 6-mayo-2026 | ✅ |
| Renderizado del diagrama interactivo | 7-mayo-2026 | ✅ |
| Vue Flow integrado con persistencia de layout | 8-mayo-2026 | ✅ |
| Deep dive de módulos con funciones expandibles | 8-mayo-2026 | ✅ |
| Integración del asistente IA (Gemini) | 13-mayo-2026 | ✅ |
| Despliegue en producción (Kubernetes) | 18-mayo-2026 | ✅ |
| Documentación completa (memoria, manuales) | 19-mayo-2026 | ✅ |

### Desviaciones respecto al plan inicial

El plan inicial sufrió dos ajustes notables, ambos por sub-estimación de complejidad:

1. **Vue Flow** se reveló más complejo de lo previsto. El control manual de nodos/edges en modo
   controlado y la sincronización del layout con la BD costaron dos días más de los previstos.
2. **Integración de IA con Gemini**: la documentación oficial es escasa respecto a los límites
   concretos del free tier. Hubo que dedicar tiempo extra a manejar errores de cuota (429) y
   construir una UI que permitiera al usuario cambiar de modelo sin perder el contexto de la
   conversación.

Como compensación, se redujo el alcance de la **exportación a otros formatos** (PNG/SVG) y se
priorizó dejar el asistente IA pulido, dado su mayor valor para la defensa y el cumplimiento del
requisito obligatorio de IA del ciclo.

---

\pagebreak

## 2.3. Desarrollo del proyecto

### Descripción de la solución implementada

CodeAtlas es una **aplicación web monolítica modular** compuesta por dos procesos independientes que
se comunican mediante una API REST sobre HTTP:

- **Frontend**: SPA en Vue 3 construida con Vite y Pinia. Renderiza la interfaz, gestiona el estado
  local y se comunica con el backend mediante un cliente HTTP centralizado que inyecta el JWT en
  cada petición.
- **Backend**: API REST en Node.js + Express, conectada a una base de datos MySQL 8 mediante el
  driver `mysql2/promise` con pool de conexiones.

Adicionalmente, el backend consume **Google Gemini** como servicio externo para el módulo del
asistente IA.

```
+-----------------------+      HTTP / JSON       +-----------------------+
|   Frontend (Vue)      |  ------------------>   |   Backend (Node.js)   |
|   Vite + Pinia        |  <------------------   |   Express + MySQL2    |
+-----------------------+    JWT Bearer Token    +-----------+-----------+
                                                             |
                                                             v
                                                +------------------------+
                                                |   MySQL 8              |
                                                |   Base de datos        |
                                                +------------------------+
                                                             |
                                                             v
                                                +------------------------+
                                                |   Google Gemini API    |
                                                |   (servicio externo)   |
                                                +------------------------+
```

### Tecnologías utilizadas

#### Frontend

| Tecnología | Versión | Función |
|---|---|---|
| Vue.js | 3.4 | Framework UI principal (Composition API). |
| Vite | 5.0 | Bundler y servidor de desarrollo. |
| Vue Router | 4.2 | Enrutamiento SPA con guards de autenticación. |
| Pinia | 2.1 | Gestión de estado global (stores reactivos). |
| Vue Flow | 1.41 | Canvas interactivo de nodos y aristas. |
| Tailwind CSS | 3.4 | Sistema de utilidades CSS. |
| Lucide Icons | 0.468 | Iconografía SVG. |

#### Backend

| Tecnología | Versión | Función |
|---|---|---|
| Node.js | 18+ | Runtime JavaScript con módulos ESM. |
| Express | 4.18 | Framework HTTP. |
| MySQL2 | 3.22 | Driver de base de datos con pool de conexiones. |
| bcrypt | 6.0 | Hash de contraseñas (10 salt rounds). |
| jsonwebtoken | 9.0 | Generación y verificación de JWT. |
| multer | 1.4 | Subida de archivos en multipart. |
| js-yaml | 4.1 | Parser de YAML del frontmatter. |
| jszip | 3.10 | Generación del `.zip` del asistente IA. |
| @google/genai | 2.2 | SDK oficial de Google Gemini. |

#### Base de datos y despliegue

- **MySQL 8.0** con charset `utf8mb4`.
- **Docker** para empaquetar la aplicación.
- **Kubernetes** (infla.cat) para el despliegue en producción.

### Arquitectura de la solución

#### Backend modular por responsabilidad

Cada módulo del backend vive en `src/modules/<nombre>/` y sigue la misma estructura interna:

```
modules/
  auth/         - registro, login, JWT, middleware
  projects/     - CRUD de proyectos
  diagrams/     - CRUD de diagramas + layout
  parser/       - pipeline .md a JSON
  bot/          - integracion con Gemini
  settings/     - preferencias del usuario
```

Cada módulo expone:

- `*.routes.js` — declaración de rutas HTTP.
- `*.controller.js` — handlers que traducen HTTP ↔ servicio.
- `*.service.js` — lógica de negocio.
- `*.repository.js` — acceso a base de datos.

#### Frontend modular paralelo

Mismo principio en el frontend: cada módulo de backend tiene su equivalente en
`src/modules/<nombre>/` con sus vistas, stores Pinia y servicios HTTP.

#### Base de datos relacional

**Seis tablas** con relaciones por foreign keys y `ON DELETE CASCADE`:

```
users 1:1 user_settings
users 1:N projects 1:N diagrams
users 1:N bot_sessions 1:N bot_files
```

Todas las tablas usan `CHAR(36)` para los IDs (UUID v1 generados por MySQL o `randomUUID()` desde
Node).

### Funcionalidades principales

#### 1. Autenticación

Registro y login con email + contraseña. El backend hashea las contraseñas con **bcrypt** (10 salt
rounds) y emite **JWT** firmados con HS256 (expiración 7 días). El frontend almacena el token en
`localStorage` bajo la clave `codeatlas:auth` y lo añade en la cabecera `Authorization: Bearer ...`
de cada petición a `/api/*`.

#### 2. Gestión de proyectos y diagramas

Cada usuario puede crear, renombrar y borrar **proyectos**. Dentro de cada proyecto puede generar
**diagramas** subiendo una carpeta `app-doc/` con sus archivos `.md`. El parser convierte los
archivos en un modelo JSON unificado que se persiste junto con el layout en la tabla `diagrams`.

#### 3. Parser del formato CodeAtlas

Pipeline lineal de seis etapas:

1. **Extracción** del frontmatter YAML y las secciones `## Nombre` de cada archivo.
2. **Parseo YAML** del frontmatter.
3. **Validación** contra un esquema declarativo por tipo (`type: module`, `type: entity`, etc.) que
   comprueba campos obligatorios y tipos.
4. **Construcción del modelo** unificado JSON.
5. **Resolución de referencias** cruzadas (avisos no bloqueantes para IDs inexistentes).
6. **Cálculo del layout** automático (organización por columnas: DB | backend | frontend | screens).

Cada etapa vive en su propio archivo dentro de `parser/core/`, lo que facilita extender o sustituir
piezas concretas.

#### 4. Renderizado interactivo

El frontend usa **Vue Flow** en modo controlado: las refs locales `nodes` y `edges` se sincronizan
manualmente con los eventos `@nodes-change` y `@edges-change`. Las aristas usan un componente
personalizado `FloatingEdge` que calcula automáticamente los puntos de anclaje según la geometría de
cada nodo, evitando el típico problema de aristas atravesando otros nodos.

#### 5. Deep dive de módulos

Doble click sobre un módulo del canvas conceptual abre una vista nueva
(`/diagrams/:id/modules/:moduleId`) con la estructura interna del módulo: carpetas como columnas,
archivos como nodos UML con sus funciones, y aristas entre archivos según el campo `imports`
declarado en el formato. Las funciones con campo `doc:` se muestran como botones desplegables que
expanden la descripción al pulsar.

#### 6. Asistente IA (Gemini) — funcionalidad estrella del proyecto

Implementa el requisito obligatorio de IA del ciclo y elimina la barrera de entrada al formato
CodeAtlas. El usuario describe su aplicación en lenguaje natural y el bot devuelve los archivos
`.md` correctamente formateados.

**Características principales**:

- **Sesiones múltiples** por usuario: cada conversación es independiente y persistente. Permite
  tener varios proyectos en paralelo.
- **Selector de modelo** entre Gemini 2.5 Flash y Gemini 2.5 Flash-lite, con persistencia en
  `localStorage`.
- **Validación automática** de cada respuesta del LLM antes de aceptarla: path seguro, frontmatter
  YAML parseable, campos obligatorios según el `type`.
- **Reintento automático** con corrección si la validación falla.
- **Estado de sesión inyectado** en el system prompt en cada turno: el bot sabe qué archivos ya ha
  generado y no los duplica.
- **Manejo elegante de errores de cuota**: cuando se agota el free tier de un modelo, aparece una
  tarjeta amarilla con la opción de cambiar al otro modelo y reintentar el mensaje automáticamente,
  sin perder el contexto.
- **Descarga del resultado** como `app-doc.zip` listo para subir al generador de diagramas. JSZip
  crea la jerarquía de carpetas automáticamente a partir de los paths de cada archivo.

#### 7. Configuración del usuario

Pantalla de ajustes que permite cambiar el tema visual (claro/oscuro), editar nombre y email del
perfil, y cambiar la contraseña. El tema se aplica al instante en local y se sincroniza con el
backend en segundo plano (fire-and-forget).

### Decisiones técnicas relevantes

#### Por qué Vue 3 + Vite en lugar de React/Next.js

Vue tiene una curva de aprendizaje más suave y la Composition API se asemeja mucho a los hooks de
React sin la complejidad del routing y server components de Next. Vite ofrece el HMR más rápido del
ecosistema (~50ms) y `vite build` produce un bundle estático que se puede servir desde cualquier
servidor sin runtime Node en el cliente.

#### Por qué MySQL en lugar de PostgreSQL o MongoDB

El requisito del ciclo exige una BD relacional con mínimo 3 tablas relacionadas. MySQL es el motor
más extendido y soportado por la infraestructura del centro (infla.cat). El proyecto no necesita
features avanzadas de Postgres (JSONB, índices GIN, etc.) ni la flexibilidad documental de Mongo: el
modelo es claramente relacional.

#### Por qué JWT en lugar de sesiones en servidor

JWT permite escalar horizontalmente sin necesidad de sticky sessions ni almacén compartido de
sesiones (Redis, BD). El coste es que no se pueden invalidar tokens individualmente, pero para una
aplicación académica con expiración de 7 días es aceptable.

#### Por qué Vue Flow para el canvas

Construir un canvas de nodos y aristas desde cero hubiera consumido la mitad del tiempo del
proyecto. Vue Flow ofrece zoom, paneo, snap-to-grid, conexiones, controles, y un sistema de
nodos/aristas custom con Vue 3, todo gratis y bien documentado.

#### Por qué Gemini en lugar de Ollama local

Ollama requiere recursos significativos (4-8 GB RAM para un modelo decente), y el namespace de
Kubernetes del centro está limitado a ~10 GB RAM. Gemini en su free tier es gratis, no consume
recursos del cluster y produce salida estructurada con `responseSchema` de calidad suficiente para
nuestro caso.

#### Por qué `responseSchema` en lugar de prompt-engineering puro

El SDK de Gemini soporta un schema JSON que **obliga** al modelo a devolver una estructura concreta.
Esto elimina la necesidad de parsear texto libre y reduce drásticamente los errores de formato. La
salida siempre es `{ reply: string, files: [{ path, content }] }`, no markdown a pelo.

#### Por qué dos modelos seleccionables

Gemini 2.5 Flash es más capaz pero su free tier es muy restrictivo en proyectos nuevos (~20 RPD).
Flash-lite tiene cuota mucho más amplia (~1000 RPD) y para nuestro caso (generación estructurada con
schema) la calidad es prácticamente equivalente. Dar al usuario la elección permite seguir
trabajando cuando la cuota del modelo principal se agota.

#### Por qué validar la salida del LLM antes de persistirla

Aunque `responseSchema` garantiza el tipo de datos, no garantiza la corrección semántica (que los
campos obligatorios del frontmatter de cada tipo estén presentes, que los IDs no sean duplicados,
etc.). Validar y reintentar una vez ahorra al usuario tener que pedir manualmente las correcciones.

---

\pagebreak

## 2.4. Evaluación y resultados

### Análisis del grado de cumplimiento de los objetivos

| Objetivo | Estado | Comentario |
|---|---|---|
| F1. Registro y autenticación | ✅ Completo | bcrypt + JWT, validación en formulario y backend. |
| F2. Organización por proyectos | ✅ Completo | CRUD de proyectos con descripciones y contadores. |
| F3. Parser de `.md` → modelo JSON | ✅ Completo | Pipeline de 6 etapas con validación. |
| F4. Renderizado interactivo | ✅ Completo | Vue Flow con `FloatingEdge` y deep dive. |
| F5. Persistencia de diagramas | ✅ Completo | Modelo y layout en `LONGTEXT`. |
| F6. Deep dive de módulos | ✅ Completo | Carpetas, archivos, funciones con `doc:` expandibles. |
| F7. Integración de IA | ✅ Completo | Gemini con sesiones, validación, reintentos y zip. |
| F8. Carpeta `app-doc/` como zip | ✅ Completo | JSZip con jerarquía automática. |
| NF1. Producción con HTTPS | ✅ Completo | Desplegado en infla.cat con TLS. |
| NF2. Autenticación stateless | ✅ Completo | JWT sin almacén de sesiones. |
| NF3. BD con ≥ 3 tablas relacionadas | ✅ Completo | 6 tablas con FK y cascadas. |
| NF4. Frontend responsive y HTML válido | ✅ Completo | Tailwind con breakpoints + validación W3C. |
| NF5. Robustez ante SQLi | ✅ Completo | mysql2 con parámetros preparados en todas las queries. |
| NF6. Código mantenible | ✅ Completo | Separación por capas y módulos consistentes. |

**Grado de cumplimiento global: 100 %** de los objetivos planteados.

### Ampliaciones realizadas

Además del MVP inicial, se han incorporado funcionalidades no contempladas en el plan original:

- **Selector de modelo IA en la UI** con persistencia y cambio en caliente.
- **Tarjeta de error de cuota** con sugerencia automática del modelo alternativo y reintento del
  mismo mensaje.
- **Sesiones múltiples** del bot por usuario (originalmente se planeó una sola conversación global).
- **Contexto de sesión inyectado** automáticamente al system prompt para que el bot no pierda de
  vista los archivos ya generados al cambiar de modelo.
- **Auto-rename de sesiones** con los primeros 50 caracteres del primer mensaje del usuario.
- **Documentación completa** del proyecto **dentro del propio formato CodeAtlas**
  (`aplicacion/app-doc/`) — el proyecto se documenta a sí mismo, sirviendo de ejemplo y test de
  integración del parser.
- **Vista detallada del módulo** (deep dive) con notas expandibles en funciones (campo `doc:`).
- **Diagramas múltiples por proyecto** con thumbnails y eliminación selectiva.

### Grado de implementación

Todas las funcionalidades planificadas están implementadas y operativas. El despliegue en producción
está activo y accesible vía HTTPS. La base de datos contiene datos de prueba que cubren todos los
casos: usuarios reales, proyectos, diagramas con layouts personalizados, sesiones del bot con
archivos generados.

### Herramientas utilizadas

| Categoría | Herramienta | Uso |
|---|---|---|
| **Desarrollo** | VS Code | IDE principal. |
| **Lenguajes** | JavaScript ES2022, SQL, YAML | Backend, frontend y formato. |
| **Control de versiones** | Git | Repositorio del proyecto. |
| **Gestión de proyecto** | ProjectLibre | Diagrama de Gantt y planificación. |
| **Base de datos** | MySQL Workbench / DBeaver | Inspección y consulta de BD. |
| **API testing** | curl y scripts Node | Smoke tests del backend. |
| **IA externa** | Google AI Studio | Cuenta y gestión de API key. |
| **Diseño gráfico** | Excalidraw | Bocetos iniciales del UI. |
| **Documentación** | Markdown + Pandoc | Generación de PDFs desde `.md`. |

### Incidencias y resoluciones

#### Problema 1 — Vue Flow en modo controlado

**Síntoma**: las posiciones de los nodos no se persistían en BD al moverlos, y se perdían al
recargar.

**Causa**: Vue Flow por defecto opera en modo "no controlado" donde mantiene su propio estado
interno. Las refs locales `nodes` y `edges` no se actualizaban con los movimientos del usuario.

**Solución**: pasar `:apply-default` a `false` en el componente, gestionar `@nodes-change`
manualmente y sincronizar el ref con cada cambio. Disparar un `PATCH /api/diagrams/:id/layout` con
debounce de 1 segundo tras cada movimiento.

#### Problema 2 — Aristas atravesando nodos

**Síntoma**: las aristas con `straight` o `step` atravesaban otros nodos del canvas, generando un
grafo visualmente sucio.

**Solución**: implementar un componente personalizado `FloatingEdge.vue` que calcula los puntos de
anclaje en el borde de cada nodo según la dirección de la conexión (`getEdgeParams` con cálculo
geométrico). El resultado es aristas que siempre salen y entran por los lados más cercanos del nodo.

#### Problema 3 — Cuota de Gemini agotada en el free tier

**Síntoma**: tras unos pocos mensajes, el bot devolvía 429 `RESOURCE_EXHAUSTED` con un mensaje
técnico ilegible.

**Causa**: el free tier de Gemini 2.5 Flash en proyectos nuevos está limitado a ~20 requests por
día, y cada mensaje del usuario puede consumir 2 (uno inicial + un reintento de validación).

**Solución**: parsear el JSON del error 429, distinguir entre cuota por minuto (transitoria) y por
día (no recuperable), y devolver al frontend una respuesta estructurada
`{ code: 'QUOTA_EXCEEDED', model, suggestedModel }` . La UI muestra una tarjeta amarilla con un
botón "Cambiar a Flash-lite y
reintentar" que cambia el modelo y reenvía el mensaje en una sola pulsación.

#### Problema 4 — Pérdida de contexto al cambiar de modelo

**Síntoma**: al cambiar de modelo a mitad de conversación, el modelo nuevo no veía los archivos que
ya se habían generado.

**Causa**: solo se persistía el `reply` del bot en el historial, no los archivos generados.

**Solución**: construir un bloque de "Estado de la sesión" con la lista de paths ya generados e
inyectarlo al final del system prompt en cada llamada. Coste estimado: ~300 tokens extra por turno.
Beneficio: continuidad total entre modelos.

#### Problema 5 — Multer y archivos en memoria

**Síntoma**: al principio se intentó guardar los archivos subidos en disco temporal, lo que añadía
complejidad (cleanup) y latencia.

**Solución**: usar `multer({ storage: memoryStorage() })`. Los archivos llegan al controller como
`Buffer` en `req.files`, se procesan al vuelo y nunca tocan disco. Más rápido y sin gestión de
temporales.

### Lecciones aprendidas

1. **Definir bien el formato antes de construir el parser** ahorra muchas iteraciones. Tener el
   formato CodeAtlas estabilizado al principio permitió que parser, generador y validador estuvieran
   siempre alineados.
2. **Hacer que el proyecto se documente a sí mismo** es una técnica potente: cualquier cambio en el
   formato se detecta inmediatamente porque la `app-doc/` propia deja de parsearse.
3. **El LLM no es mágico**: sin validación posterior y reintento estructurado, la salida es
   inconsistente. Con un schema JSON forzado y validación posterior, sí es fiable.
4. **Las restricciones del entorno** (memoria del cluster, free tier de Gemini) son condicionantes
   técnicos reales, no detalles. Ignorarlas en el diseño habría llevado a un proyecto inviable.
5. **Iterar en cortos ciclos** con tasks documentados en el repositorio es mucho más productivo que
   planificar todo de golpe al principio.

---

\pagebreak

# 3. Elementos finales

## 3.1. Conclusiones

### Resumen de los resultados

CodeAtlas se entrega como una aplicación web completa, desplegada en producción y cumpliendo todos
los requisitos técnicos del ciclo: dos procesos separados (frontend Vue 3 + backend Node.js), API
REST con autenticación JWT, base de datos relacional con 6 tablas correctamente relacionadas,
integración de un modelo de IA externo, frontend responsive con HTML validado y robustez ante
inyección SQL.

El proyecto cubre todos los objetivos funcionales planificados, además de varias ampliaciones no
contempladas inicialmente (sesiones múltiples del bot, selector de modelo, manejo elegante de
errores de cuota, deep dive con notas expandibles). Las funcionalidades están todas operativas,
probadas manualmente y documentadas dentro del propio repositorio.

### Valoración personal

Trabajar en CodeAtlas ha sido el proyecto técnicamente más completo que he afrontado durante el
ciclo. Me ha obligado a integrar conocimientos de muchas áreas a la vez (frontend, backend, BD,
autenticación, parseo, layout de grafos, integración con IA) y a coordinar todo dentro de un único
entregable coherente.

Algunas decisiones que en su momento parecieron menores resultaron clave a posteriori. Definir un
formato textual estable al principio simplificó muchísimo el resto del desarrollo, porque parser,
generador y UI siempre compartieron una sola fuente de verdad. La decisión de hacer que el proyecto
se documente a sí mismo, además de ser un ejercicio elegante, sirvió como test de integración
continua del parser.

La integración del asistente IA fue lo más arriesgado y a la vez lo más satisfactorio. Pensé
inicialmente que sería un añadido cosmético para cumplir el requisito del ciclo, pero acabó siendo
una pieza central del producto: elimina la principal barrera de entrada al formato CodeAtlas
(aprenderse el frontmatter) y permite al usuario empezar a usar la aplicación con una descripción en
lenguaje natural.

### Propuestas de mejora

- **Edición manual de los `.md`** desde la propia UI del asistente, en lugar de solo permitir
  regenerarlos vía el bot.
- **Comparación visual** entre dos diagramas (diff) para ver cambios entre versiones de la
  documentación.
- **Notificaciones del estado del bot** mientras genera (typing indicator más informativo que
  muestre qué tipo de archivo está creando).
- **Exportación del diagrama a PNG/SVG** para incluirlo directamente en otros documentos sin captura
  de pantalla.
- **Modo claro/oscuro automático** según la preferencia del sistema operativo
  (`prefers-color-scheme`).
- **Tests automatizados** (Vitest para unit tests del parser, Playwright para E2E del flujo
  completo).

### Líneas futuras de desarrollo

- **`application-diagram`**: el segundo modo del formato que ya está definido pero no implementado,
  que permitirá analizar aplicaciones ya construidas leyendo su código fuente y generar el diagrama
  sin que el usuario escriba documentación. Este modo abriría el producto a usuarios que ya tienen
  aplicaciones existentes sin documentar.
- **Multi-usuario por proyecto**: permitir compartir un proyecto con otros usuarios, con permisos de
  lectura o edición, para uso en equipos.
- **Versionado del diagrama**: historial de cambios con la posibilidad de volver a un estado
  anterior (similar a Git pero a nivel de modelo).
- **Plantillas pre-rellenadas** de `app-doc/` para stacks típicos (Vue + Express, React + NestJS,
  Django, etc.) que el usuario pueda usar como punto de partida.
- **Integración con repositorios Git**: leer la `app-doc/` directamente de un repositorio remoto en
  vez de subir archivos manualmente.
- **Métricas de uso del bot** y panel de administración para entender cómo se usa el asistente en la
  práctica.

---

\pagebreak

## 3.2. Referencias y bibliografía

### Referencias técnicas

- **Vue.js 3** — *Documentación oficial.* [vuejs.org](https://vuejs.org)
- **Vite** — *Frontend tooling.* [vitejs.dev](https://vitejs.dev)
- **Pinia** — *State management for Vue.* [pinia.vuejs.org](https://pinia.vuejs.org)
- **Vue Flow** — *Interactive node-based UIs.* [vueflow.dev](https://vueflow.dev)
- **Express** — *Fast, unopinionated, minimalist web framework for Node.js.*
  [expressjs.com](https://expressjs.com)
- **MySQL 8.0** — *Reference Manual.* [dev.mysql.com/doc](https://dev.mysql.com/doc/)
- **Google Gemini API** — *Generative Language API.*
  [ai.google.dev/gemini-api/docs](https://ai.google.dev/gemini-api/docs)
- **JWT.io** — *Introduction to JSON Web Tokens.* [jwt.io/introduction](https://jwt.io/introduction)
- **bcrypt** — *Password hashing library for Node.js.*
  [npmjs.com/package/bcrypt](https://www.npmjs.com/package/bcrypt)
- **JSZip** — *Create, read and edit .zip files with JavaScript.*
  [stuk.github.io/jszip](https://stuk.github.io/jszip/)

### Recursos web

- **MDN Web Docs** — referencia continua de HTML, CSS y JavaScript.
- **Stack Overflow** — debugging de errores específicos durante el desarrollo.
- **Tailwind CSS Docs** — referencia del sistema de utilidades.
- **DBML Documentation** — formato del bloque `## Table` de las entidades de BD.

### Bibliografía consultada

- Fowler, M. *Patterns of Enterprise Application Architecture.* Addison-Wesley, 2002. — referencia
  para los patrones Repository, Service Layer y Pipeline.
- Newman, S. *Building Microservices*, 2nd ed. O'Reilly, 2021. — secciones sobre arquitectura
  modular monolítica como paso previo a microservicios.

### Eines utilitzades (resumen)

| Categoría | Herramienta |
|---|---|
| IDE | VS Code |
| Control de versiones | Git |
| Planificación | ProjectLibre |
| Diseño de bocetos | Excalidraw |
| Cliente SQL | MySQL Workbench / DBeaver |
| Diseño visual | Tailwind CSS + Lucide Icons |
| Testing manual | curl, scripts Node |
| Despliegue | Docker, Kubernetes (infla.cat) |
| Documentación | Markdown + Pandoc |

---

\pagebreak

## 3.3. Anexos

> Los anexos no cuentan dentro de las 20 páginas de la memoria.

### Anexo A — Material complementario

- **Repositorio del proyecto**: contiene todo el código fuente, la documentación interna y el
  historial de tasks completados (`aplicacion/docs/tasks/done/`).
- **Manual técnico** — `Manual Tecnico - CodeAtlas.md` (en `documentos-clase/`).
- **Manual de usuario** — `Manual de Usuario - CodeAtlas.md` (en `documentos-clase/`).
- **`app-doc/` del propio proyecto** — la documentación de CodeAtlas en su propio formato, dentro de
  `aplicacion/app-doc/`. Incluye 45 archivos `.md` que el parser propio valida sin errores.
- **Planificación detallada** — `gantt-final.md` y `gantt-projectlibre.csv` (en la raíz del
  repositorio).

### Anexo B — Documentación adicional

- **`ia-doc/GUIA-IA.md`** — guía completa del formato CodeAtlas que se utiliza como system prompt
  del asistente IA. Constituye la especificación canónica del formato.
- **`ia-doc/formatos/*.md`** — formatos detallados por tipo de archivo (módulos, pantallas, flujos,
  base de datos, reglas del sistema).
- **`aplicacion/AGENTS.md`** — guía técnica para agentes IA que trabajan sobre el código del
  proyecto.
- **`aplicacion/README.md`** — instrucciones rápidas de instalación y arranque.

### Anexo C — Capturas de pantalla relevantes

> Las capturas de pantalla se incluyen en el directorio `documentos-clase/capturas/` del repositorio entregable. Capturan los siguientes flujos:

1. Pantalla de login con campos de email y contraseña.
2. Dashboard con la lista de proyectos del usuario.
3. Vista de un proyecto con sus diagramas.
4. Pantalla del generador de diagramas con subida de archivos.
5. Vista principal del diagrama con módulos, base de datos y pantallas conectados.
6. Vista de deep dive de un módulo con sus carpetas, archivos y funciones expandibles.
7. Pantalla del asistente IA con sidebar de conversaciones, chat y árbol de archivos generados.
8. Tarjeta de error de cuota con el botón "Cambiar a Flash-lite y reintentar".
9. Pantalla de ajustes con los tres bloques (apariencia, perfil, contraseña).

### Anexo D — Diagramas relevantes

#### Diagrama de arquitectura general

Incluido en el capítulo 2.3.

#### Diagrama entidad-relación de la base de datos

```
                       +-------+
                       | users |
                       +---+---+
                           |
       +-------+-----------+-----------+----------------+
       |       |           |                            |
      1:1     1:N         1:N                          1:N
       |       |           |                            |
       v       v           v                            v
+--------------+ +----------+ +----------+    +----------------+
| user_settings| | projects | | diagrams |    | bot_sessions   |
+--------------+ +----+-----+ +----------+    +-------+--------+
                      |                               |
                     1:N                             1:N
                      |                               |
                      v                               v
                 +----------+                   +-----------+
                 | diagrams |                   | bot_files |
                 +----------+                   +-----------+
```

#### Diagrama del propio CodeAtlas dentro de la aplicación

El diagrama **"CodeAtlas MVP Final"** generado dentro de la propia aplicación a partir de la
documentación `app-doc/` del proyecto. Es accesible desde el dashboard del usuario y constituye la
representación visual definitiva de la arquitectura del sistema, generada por el mismo software
descrito.
