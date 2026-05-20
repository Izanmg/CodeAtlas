# Manual de Usuario

# **CodeAtlas**

### *De la documentación al diagrama: la arquitectura de tu aplicación, visible.*

---

**Versión del documento:** 1.0
**Versión de la aplicación:** 1.0 (MVP final)
**Fecha de actualización:** 19 de mayo de 2026
**Autor del proyecto:** Izan Mendoza
**Centro:** Proyecto de Síntesis · CFGS Desarrollo de Aplicaciones Web (DAW)
**Contacto técnico:** izanmg2706@gmail.com

---

\pagebreak

# Prefacio

## Cómo utilizar este manual

Este documento es la guía oficial de uso de **CodeAtlas**, una aplicación web que transforma documentación escrita en archivos Markdown (`.md`) en diagramas visuales navegables de la arquitectura de una aplicación de software.

El manual está pensado para leerse en dos modos:

- **Lectura lineal:** de principio a fin si es la primera vez que usas la herramienta.
- **Consulta puntual:** acude directamente al capítulo o sección concreta cuando ya conoces lo básico y necesitas resolver una tarea específica.

Para una primera toma de contacto basta con leer los capítulos **1, 2 y 3**. Los capítulos **4 y 5** son la referencia completa de cada funcionalidad, y los capítulos **6 y 7** sirven como apoyo si surge algún problema o necesitas más información.

## A quién va dirigido

CodeAtlas está pensado para **desarrolladores, estudiantes de informática, equipos técnicos y arquitectos de software** que necesiten:

- Documentar visualmente una aplicación que están planificando.
- Entender de un vistazo la arquitectura de una aplicación ya desarrollada.
- Compartir con el equipo una representación clara y navegable del sistema.

No es necesario tener conocimientos avanzados de programación para utilizar la interfaz: basta con conocer el formato Markdown básico. Para los flujos asistidos por IA ni siquiera se necesita conocer el formato.

## Convenciones utilizadas en el documento

Para que la lectura sea consistente, se utilizan las siguientes convenciones tipográficas:

| Convención | Significado |
|---|---|
| `texto en mono` | Nombres de archivo, comandos, rutas, identificadores técnicos. |
| **Texto en negrita** | Nombres de botones, acciones del usuario o conceptos clave. |
| *Texto en cursiva* | Énfasis o términos definidos en el glosario. |
| > Bloque citado | Notas, recomendaciones o advertencias importantes. |
| **TIP** | Consejo práctico para sacar más partido de una función. |
| **AVISO** | Comportamiento que conviene conocer antes de actuar. |

## Iconos y símbolos

La interfaz de CodeAtlas utiliza los iconos de la familia **Lucide Icons**. A lo largo del manual aparecerán algunos de los más frecuentes con su significado:

| Icono visual | Nombre interno | Significado en la app |
|---|---|---|
| ➕ | Plus | Crear un nuevo elemento (proyecto, diagrama, conversación). |
| 🔍 | Search | Buscar o filtrar contenido. |
| 📁 | Folder | Proyecto o carpeta. |
| 🔗 | Network | Diagrama o conexión. |
| ⬆️ | Upload | Subir archivos. |
| 💾 | Save | Guardar cambios. |
| ↩️ | Undo / Redo | Deshacer o rehacer una acción. |
| ⚙️ | Settings | Configuración. |
| 🤖 | Bot | Asistente IA. |
| 🌗 | Sun / Moon | Cambiar tema claro u oscuro. |
| 🚪 | LogOut | Cerrar sesión. |

## Terminología básica

A continuación se introducen los términos esenciales que se utilizan en toda la aplicación:

- **Proyecto:** entidad contenedora principal. Agrupa uno o varios diagramas relacionados con una misma aplicación.
- **Diagrama:** representación visual generada a partir de un conjunto de archivos Markdown.
- **Módulo:** unidad funcional de la aplicación documentada (por ejemplo, *Autenticación* o *Pagos*).
- **Pantalla:** una vista o página de la aplicación documentada.
- **Flujo:** secuencia de pasos que recorre módulos, pantallas y base de datos para realizar una acción del usuario.
- **Entidad:** tabla o estructura de datos persistida en base de datos.
- **Carpeta `app-doc/`:** carpeta de documentación con el formato esperado por CodeAtlas.
- **Nodo:** cada bloque visible dentro de un diagrama.
- **Capa:** clasificación de un nodo (`backend`, `frontend`, `screen`, `database`).

## Notas y advertencias

> **AVISO:** CodeAtlas no almacena los archivos `.md` originales en su base de datos. Solo guarda el **JSON resultante** del análisis. Conserva tus archivos `.md` en local para poder regenerar el diagrama si lo necesitas.

> **TIP:** Si nunca has documentado una arquitectura, empieza por el **Asistente IA** (capítulo 4.6). Te guiará paso a paso y generará los archivos por ti.

---

\pagebreak

# Tabla de contenidos

1. **Introducción a la aplicación**
   1.1. Visión general
   1.2. Principales funcionalidades
   1.3. Requisitos del sistema
   1.4. Navegadores compatibles
   1.5. Primeros pasos

2. **Guía rápida**
   2.1. Funciones esenciales
   2.2. Atajos de teclado principales
   2.3. Consejos rápidos
   2.4. Interfaz de usuario

3. **Funcionalidades detalladas**
   3.1. Módulo de autenticación (Login y Registro)
   3.2. Dashboard (Listado de proyectos)
   3.3. Vista de proyecto
   3.4. Generador de diagramas
   3.5. Visor de diagrama
   3.6. Vista interna del módulo (Deep Dive)
   3.7. Asistente IA
   3.8. Configuración de usuario

4. **Procedimientos paso a paso**
   4.1. Tareas comunes
   4.2. Casos de uso

5. **Resolución de problemas**
   5.1. Problemas comunes
   5.2. Preguntas más frecuentes

6. **Recursos adicionales**
   6.1. Soporte
   6.2. Recursos complementarios

7. **Glosario**

8. **Índice alfabético**

---

\pagebreak

# 1. Introducción a la aplicación

## 1.1. Visión general

**CodeAtlas** es una aplicación web modular pensada para convertir documentación escrita en archivos Markdown en **diagramas visuales navegables** que muestran la arquitectura completa de una aplicación de software.

El flujo conceptual de uso es muy sencillo:

```
Archivos .md  →  CodeAtlas parsea  →  Diagrama interactivo
```

El usuario sube uno o varios archivos `.md` que describen módulos, pantallas, base de datos, flujos y reglas. CodeAtlas los analiza, genera un modelo interno y lo presenta como un **canvas interactivo** donde se pueden explorar las relaciones entre todas las piezas del sistema.

Lo que hace especial a CodeAtlas frente a otras herramientas de diagramación:

- **No dibujas el diagrama, lo describes.** Tú redactas la documentación; CodeAtlas se encarga del *layout* automático.
- **Es bidireccional con el código.** La misma documentación que sirve al equipo de desarrollo alimenta el diagrama.
- **Incluye un asistente IA integrado** que te puede generar la documentación a partir de una conversación, sin que necesites conocer el formato.

## 1.2. Principales funcionalidades

A grandes rasgos, CodeAtlas ofrece las siguientes capacidades:

- **Gestión multiusuario** con sesión persistente, registro y configuración personal.
- **Organización en proyectos** con vista en tarjetas y filtro por nombre o descripción.
- **Múltiples diagramas por proyecto**, cada uno representando un momento o enfoque diferente de la aplicación.
- **Generación automática del diagrama** a partir de uno o varios archivos `.md` (soporta drag & drop y subida de carpetas).
- **Canvas interactivo** con zoom, pan, mini-mapa, filtros por tipo de bloque, búsqueda con autocompletado y modo foco.
- **Doble modo de visualización:** *Relaciones* (estático, estructural) y *Flujos* (secuencias paso a paso animadas).
- **Panel lateral de detalle** con la información completa del bloque seleccionado.
- **Vista interna de módulos (Deep Dive)** estilo UML para inspeccionar archivos y funciones.
- **Historial de posiciones** con deshacer/rehacer y guardado del *layout*.
- **Asistente IA conversacional** que genera la documentación lista para subir.
- **Tema claro y oscuro**, configurables desde la cabecera o desde Configuración.

## 1.3. Requisitos del sistema

CodeAtlas es una **aplicación web**, por lo que se ejecuta directamente en el navegador y no requiere instalación local por parte del usuario final.

**Requisitos mínimos del cliente:**

- Conexión a Internet.
- Navegador actualizado (ver sección 1.4).
- Resolución mínima recomendada de **1280 × 720 px**.
- Habilitado JavaScript y cookies (necesario para mantener la sesión).
- 4 GB de RAM en el equipo (para diagramas grandes con cientos de nodos).

**Si despliegas tu propia instancia de CodeAtlas (entornos avanzados):**

- Node.js ≥ 18 para el backend.
- MySQL ≥ 8 para la base de datos.
- Vue 3 + Vite para el frontend.

## 1.4. Navegadores compatibles

| Navegador | Versión mínima recomendada |
|---|---|
| Google Chrome | 110 o superior |
| Mozilla Firefox | 115 o superior |
| Microsoft Edge | 110 o superior |
| Safari | 16 o superior |

> **AVISO:** la subida de **carpetas completas** mediante drag & drop utiliza el atributo `webkitdirectory`, soportado en navegadores basados en Chromium y Firefox modernos. En Safari puede requerir seleccionar los archivos uno a uno.

## 1.5. Primeros pasos

### Cómo acceder a la aplicación

CodeAtlas se utiliza desde el navegador. Abre la URL proporcionada por tu instructor o administrador (por ejemplo `http://localhost:5173` en desarrollo o el dominio público asignado en producción) y la aplicación se cargará en la pantalla inicial.

### Proceso de registro

Si es la primera vez que usas CodeAtlas:

1. En la pantalla de inicio de sesión, pulsa **«Crear cuenta»** debajo del formulario.
2. Rellena los campos del registro:
   - **Nombre:** tu nombre completo o un alias.
   - **Email:** una dirección de correo válida.
   - **Contraseña:** mínimo 8 caracteres.
3. Pulsa **«Crear cuenta»**.
4. La aplicación creará tu sesión automáticamente y te redirigirá al **Dashboard**.

### Inicio de sesión

Si ya tienes una cuenta:

1. Introduce tu **email** y tu **contraseña**.
2. Pulsa **«Entrar»**.
3. Si las credenciales son correctas, accederás al Dashboard. Si hay un error, la aplicación lo mostrará en rojo bajo el formulario.

### Tour inicial de la interfaz

La primera vez que entres verás:

- Una **cabecera global** con el logotipo de CodeAtlas, las migas de pan (breadcrumbs), el selector de tema y tu avatar.
- Una **lista vacía de proyectos** con un mensaje guía.
- Un **botón «Nuevo proyecto»** y un **botón «Asistente IA»** en la zona superior.

Pulsa **«Nuevo proyecto»** para empezar, o ve directamente al **Asistente IA** si prefieres que la herramienta te ayude desde cero.

---

\pagebreak

# 2. Guía rápida

## 2.1. Funciones esenciales

Esta sección resume las acciones que se hacen con más frecuencia. Si solo lees una parte del manual, que sea esta.

| Acción | Cómo se hace |
|---|---|
| Crear un proyecto | Dashboard → botón **«Nuevo proyecto»** → nombre + descripción → **«Crear proyecto»**. |
| Subir documentación y generar diagrama | Vista de proyecto → **«Nuevo diagrama»** → arrastra archivos `.md` → **«Generar diagrama»**. |
| Abrir un diagrama existente | Vista de proyecto → click en una tarjeta de diagrama, o Dashboard → sección **«Diagramas recientes»**. |
| Explorar un bloque del diagrama | Click sobre el nodo → se abre el panel lateral con todos sus detalles. |
| Entrar dentro de un módulo | Doble click sobre un módulo de backend o frontend para abrir su vista interna. |
| Cambiar entre Relaciones y Flujos | Toolbar superior del canvas → toggle **Relaciones / Flujos**. |
| Guardar la posición del diagrama | Botón **💾 «Guardar»** de la barra superior del canvas. |
| Pedirle a la IA que genere los `.md` | Dashboard → botón **«Asistente IA»** → describe tu app o deja que te haga preguntas. |
| Cambiar el tema | Topbar → botón con icono **sol/luna**. |
| Cerrar sesión | Topbar → avatar → **«Cerrar sesión»**. |

## 2.2. Atajos de teclado principales

| Atajo | Acción |
|---|---|
| `Enter` | Enviar mensaje al Asistente IA. |
| `Shift + Enter` | Salto de línea en el campo de mensaje del Asistente. |
| `Esc` | Cerrar el panel lateral / perder el foco del nodo seleccionado. |
| `Ctrl + Z` (`⌘ + Z` en macOS) | Deshacer la última posición del diagrama. |
| `Ctrl + Y` o `Ctrl + Shift + Z` | Rehacer. |
| `⌘ + K` | Atajo visual del campo de búsqueda global (placeholder). |

## 2.3. Consejos rápidos

- **Empieza pequeño.** Documenta primero un módulo y una pantalla. Cuando veas el diagrama, irás añadiendo más.
- **Usa el botón «cargar muestra»** de la pantalla de subida para ver un diagrama de ejemplo en segundos.
- **Fija (pin) tus proyectos importantes** desde la tarjeta del Dashboard para tenerlos siempre arriba.
- **Confía en el asistente IA** cuando dudes del formato de los `.md`. Te entrega un `.zip` listo para subir.
- **Guarda con frecuencia** si reorganizas el diagrama: el botón «Guardar» se ilumina cuando hay cambios pendientes.

## 2.4. Interfaz de usuario

### Elementos principales de la pantalla

CodeAtlas mantiene una estructura visual consistente en casi todas las pantallas:

- **Topbar (cabecera fija):** logotipo, migas de pan, buscador, tema, configuración y avatar.
- **Cabecera de página (PageHeader):** un *eyebrow* en mayúsculas pequeño + título grande + descripción + zona de acciones a la derecha.
- **Contenido principal:** centrado, con un ancho máximo de aproximadamente 1240 px.
- **Modales** para acciones puntuales como crear proyecto, editar diagrama, borrar, etc.

### Navegación básica

- **Migas de pan** (`Proyectos / Nombre del proyecto / Diagrama`) en la cabecera permiten retroceder un nivel.
- **Botón «Volver»** dentro del visor de diagrama y del Deep Dive vuelve a la pantalla anterior.
- **Logo CodeAtlas** lleva siempre al Dashboard.
- **Avatar** en la esquina superior derecha abre un menú con **Mi cuenta** y **Cerrar sesión**.

### Barra de herramientas y menús

En el **visor de diagrama** y en el **Deep Dive** se añade una **toolbar flotante** que centraliza:

- Búsqueda con autocompletado de nodos.
- Toggle de modo **Relaciones / Flujos**.
- Filtros por tipo de bloque (backend, frontend, pantalla, base de datos).
- Toggle de relaciones indirectas (líneas discontinuas).
- Botón **«Ajustar vista»** y botón **«Salir de foco»**.

Estos elementos se describen en detalle en el capítulo 3.5.

---

\pagebreak

# 3. Funcionalidades detalladas

## 3.1. Módulo de autenticación (Login y Registro)

### Descripción

El módulo de autenticación es la puerta de entrada de la aplicación. Permite que cada usuario tenga sus propios proyectos y diagramas aislados de los demás.

CodeAtlas implementa dos pantallas:

- **Login** (`/login`): para usuarios existentes.
- **Registro** (`/register`): para crear una cuenta nueva.

Ambas pantallas comparten un mismo *layout* a dos columnas: a la izquierda un panel visual con el branding del producto y a la derecha el formulario.

### Pasos detallados

**Registrarse:**

1. Abre la aplicación. Si no hay sesión, te redirige automáticamente a `/login`.
2. Pulsa el enlace **«Crear cuenta»** que aparece debajo del formulario.
3. Rellena los tres campos:
   - **Nombre:** se mostrará en tu cuenta y se usará para las iniciales del avatar.
   - **Email:** identificador único.
   - **Contraseña:** mínimo 8 caracteres recomendado.
4. Pulsa **«Crear cuenta»**. La sesión queda iniciada automáticamente.

**Iniciar sesión:**

1. Introduce tu **email** y tu **contraseña** en `/login`.
2. Pulsa **«Entrar»**.
3. Si las credenciales son correctas, accederás al Dashboard.

**Cerrar sesión:**

1. Pulsa el **avatar** en la esquina superior derecha.
2. En el menú desplegable, selecciona **«Cerrar sesión»**.

### Ejemplos de uso

> *Eres un estudiante que comparte el ordenador del aula con otros compañeros.* Cada uno tiene su propio email y su propia contraseña, así que cada uno ve solo sus proyectos al iniciar sesión.

### Mensajes de error frecuentes

| Mensaje | Significado | Solución |
|---|---|---|
| *«Introduce email y contraseña»* | Has dejado uno de los dos campos vacío. | Rellena ambos campos. |
| *«Credenciales incorrectas»* | El email no existe o la contraseña es errónea. | Revisa la escritura. Usa registro si no tienes cuenta. |

---

## 3.2. Dashboard (Listado de proyectos)

### Descripción

El Dashboard es la pantalla principal después del *login*. Es el punto de partida desde donde se accede a todo lo demás.

Se compone de:

- **Saludo personalizado** en minúsculas (*«hola, izan»*).
- **Cabecera** con el título *«Tus proyectos»* y una breve descripción.
- **Acciones de cabecera:**
  - Campo **«Filtrar proyectos…»** para buscar por nombre o descripción.
  - Botón **«Asistente IA»**.
  - Botón **«Nuevo proyecto»**.
- **Strip de estadísticas globales:** total de proyectos, total de diagramas y última actividad.
- **Sección «Fijados»:** proyectos marcados como destacados.
- **Sección «Todos los proyectos»:** resto de proyectos.
- **Sección «Diagramas recientes»:** los 3 diagramas creados más recientemente, en formato lista.

### Pasos detallados

**Crear un proyecto:**

1. Pulsa **«Nuevo proyecto»** en la cabecera.
2. En el modal, escribe un **nombre** y opcionalmente una **descripción**.
3. Pulsa **«Crear proyecto»**.
4. Se abrirá automáticamente la **vista de proyecto** recién creado.

**Filtrar proyectos:**

1. Escribe en el campo **«Filtrar proyectos…»** un fragmento del nombre o descripción.
2. Las tarjetas se actualizan en tiempo real.

**Abrir un proyecto:**

- Click en la tarjeta del proyecto.

**Abrir un diagrama reciente:**

- Click sobre la fila del diagrama en la sección **«Diagramas recientes»**.

### Tarjeta de proyecto

Cada tarjeta muestra:

- Nombre del proyecto.
- Descripción corta.
- Número de diagramas asociados.
- Fecha de última modificación.
- Indicador de fijado (pin) si está activo.
- Vista previa visual de uno de sus diagramas.

Al pasar el ratón por encima se muestran iconos adicionales para **editar** o **fijar** el proyecto. El **borrado** se hace desde el modal de edición.

---

## 3.3. Vista de proyecto

### Descripción

La vista de proyecto (`/projects/:id`) muestra el contenido de un proyecto concreto: sus metadatos y la colección de diagramas que contiene.

Estructura:

- **Migas de pan:** *Proyectos / Nombre del proyecto*.
- **Cabecera** con el **ID del proyecto**, su **nombre** y su **descripción**.
- **Botón «Nuevo diagrama»**.
- **Strip de estadísticas** con número de diagramas, última modificación y fecha de creación.
- **Listado de diagramas** en formato de tarjetas.
- **Estado vacío** (si no hay diagramas) con CTA grande **«Subir documentación»**.

### Pasos detallados

**Generar el primer diagrama del proyecto:**

1. Pulsa **«Nuevo diagrama»** o **«Subir documentación»**.
2. Sigue el proceso de la sección 3.4.

**Editar un diagrama:**

1. Pasa el ratón sobre la tarjeta del diagrama.
2. Pulsa el icono de **editar**.
3. Modifica el nombre y guarda.

**Eliminar un diagrama:**

1. Abre el modal de edición del diagrama.
2. Pulsa **«Eliminar»** y confirma.
3. El diagrama se elimina y el contador se actualiza.

### Casos de uso

> *Mismo proyecto, distintas etapas.* Un proyecto puede contener un diagrama llamado **«Arquitectura inicial»** (cómo se planificó) y otro llamado **«Arquitectura tras refactor»** (cómo quedó). Así puedes comparar versiones.

---

## 3.4. Generador de diagramas

### Descripción

La pantalla de generación (`/projects/:id/diagrams/new`) recibe los archivos Markdown del usuario, los procesa en el backend y crea un diagrama.

Componentes principales:

- **Zona de drop:** acepta archivos individuales **y carpetas completas** mediante drag & drop.
- **Botones alternativos:** **«Archivos»** y **«Carpeta»** para abrir el selector del sistema.
- **Lista de archivos seleccionados** con tamaño y opción de quitar uno o todos.
- **Campo «Nombre del diagrama»**, prerellenado con *«Arquitectura + fecha de hoy»*.
- **Enlace «cargar muestra»** que añade automáticamente 5 archivos de ejemplo para probar.
- **Botón «Generar diagrama»** que arranca el proceso.
- **Pantalla de carga** con barra de progreso y etiquetas por fase.

### Pasos detallados

1. Desde la vista de proyecto, pulsa **«Nuevo diagrama»**.
2. **Sube tus archivos `.md`:**
   - Arrástralos sobre la zona indicada (admite varios y carpetas anidadas).
   - O pulsa **«Archivos»** / **«Carpeta»** para seleccionarlos.
3. (Opcional) Quita archivos que no quieras incluir con la **×** o pulsa **«Quitar todos»**.
4. Edita el **nombre del diagrama** si quieres uno distinto.
5. Pulsa **«Generar diagrama»**.
6. Aparece la barra de progreso. Cuando finalice, te redirige automáticamente al **visor del diagrama**.

### Ejemplo: cargar la muestra

Si nunca has utilizado CodeAtlas:

1. Entra en cualquier proyecto vacío.
2. Pulsa **«Nuevo diagrama»**.
3. Pulsa **«↳ cargar muestra»**.
4. Pulsa **«Generar diagrama»**.
5. Se generará un diagrama de prueba con módulos, pantallas, BD y reglas.

### Formato de los archivos esperados

CodeAtlas espera una carpeta `app-doc/` con la siguiente estructura:

```
app-doc/
├── 01-modules.md            ← índice de módulos
├── 05-system-rules.md       ← reglas globales
├── modules/
│   ├── backend/
│   │   └── {id}-backend-modules.md
│   └── frontend/
│       └── {id}-frontend-modules.md
├── database/
│   └── {id}-database.md
├── screens/
│   └── {id}-screens.md
└── flows/
    └── {id}-flows.md
```

Cada archivo lleva una **cabecera YAML** (frontmatter) que describe sus metadatos. Si nunca has escrito un `app-doc/`, deja que el **Asistente IA** (sección 3.7) te lo genere.

---

## 3.5. Visor de diagrama

### Descripción

El visor (`/diagrams/:id`) es el corazón de CodeAtlas. Es una pantalla a pantalla completa con **canvas interactivo**, **toolbars flotantes**, **panel lateral** y dos modos de visualización.

#### Capas visibles en el canvas

| Capa | Color asociado | Significado |
|---|---|---|
| **Backend** | Naranja | Módulos del servidor con endpoints y funciones. |
| **Frontend** | Azul | Módulos del cliente, agrupan pantallas y consumen API. |
| **Screen** (Pantalla) | Verde | Vistas o páginas de la aplicación. |
| **Database** (BD) | Morado | Entidades con tabla DBML y relaciones. |
| **Rules** (Reglas) | Amarillo | Reglas globales del sistema; aparecen en panel lateral, no en el canvas. |

#### Tipos de conexión

- **Línea continua:** relación directa (ej. una pantalla pertenece a un módulo).
- **Línea discontinua:** uso indirecto (ej. un módulo de backend usa una BD).

### Componentes de la pantalla

- **Top bar del diagrama:** botón **«Volver»**, ruta `proyecto / diagrama`, botones **Undo / Redo / Guardar** y contador de bloques.
- **Toolbar superior (Vista del diagrama):** búsqueda, modo, filtros, indirectas, fit y *Salir de foco*.
- **Panel de Reglas** (modo Relaciones, izquierda): muestra una visión general del sistema y las reglas globales.
- **Panel de Flujo** (modo Flujos, izquierda): muestra los pasos del flujo seleccionado.
- **Selector de flujos** (modo Flujos, derecha): lista de flujos disponibles.
- **Leyenda flotante** (esquina inferior izquierda): tipos de bloque y conexiones.
- **Mini-mapa y controles de zoom** (esquina inferior derecha).
- **Panel lateral derecho (SidePanel):** detalle del nodo seleccionado.

### Modo Relaciones

Es el modo por defecto. Muestra todos los nodos del sistema con las conexiones estructurales:

- Pertenencia (pantalla → módulo frontend).
- Consumo de API (frontend → backend).
- Uso de BD (backend → entidad).
- Dependencias entre módulos (línea discontinua).
- Navegación entre pantallas (línea discontinua).

#### Filtros por tipo de bloque

En la toolbar puedes **ocultar/mostrar** una capa entera:

1. Abre la toolbar pulsando la *pill* «Vista del diagrama».
2. Pulsa el chip de un tipo (Backend, Frontend, Pantalla, BD) para alternar su visibilidad.

#### Toggle de relaciones indirectas

El icono junto a los filtros activa o desactiva las **líneas discontinuas** para reducir el ruido visual.

#### Búsqueda con autocompletado

En el campo de búsqueda de la toolbar:

1. Escribe parte del nombre o ID de un nodo.
2. Las sugerencias aparecen automáticamente bajo el campo.
3. Mientras escribes, los nodos que no coinciden se atenúan (modo *preview*).
4. Al seleccionar una sugerencia, el canvas se **bloquea** mostrando solo ese nodo y sus vecinos directos.
5. Pulsa la **×** del campo o el botón **«Salir de foco»** para volver a la vista completa.

### Modo Flujos

Pulsa **«Flujos»** en la toolbar. El canvas cambia para mostrar **secuencias paso a paso**:

- A la izquierda aparece el **panel de pasos** del flujo activo.
- A la derecha, el **selector de flujos** con la lista de flujos disponibles.
- Por defecto se muestran **«todos los flujos»**.
- Si seleccionas uno, solo los nodos que participan se ven al 100% y los demás se atenúan.
- Las **aristas amarillas discontinuas animadas** indican la secuencia de pasos.
- Si la misma transición aparece varias veces, se muestra un *badge* `×N`.

### Panel lateral del nodo (SidePanel)

Al hacer click en un nodo se abre un panel a la derecha con varias pestañas:

- **Overview:** descripción, propósito y datos generales.
- **Details:** información completa (ID, capa, dependencias, propiedades específicas del tipo).
- **Connections:** lista de conexiones entrantes y salientes con enlaces directos.

Para cerrar el panel: pulsa la **×**, haz click en el lienzo o pulsa `Esc`.

### Reorganizar el diagrama

- **Arrastra** un nodo con el ratón para reposicionarlo. CodeAtlas guarda automáticamente el snapshot en el historial.
- Pulsa **Undo (Ctrl+Z)** o **Redo (Ctrl+Y)** para deshacer o rehacer movimientos.
- Pulsa **«Guardar»** para persistir el nuevo *layout*. El botón se ilumina cuando hay cambios sin guardar.

> **AVISO:** Si intentas salir del diagrama con cambios sin guardar, aparece un modal **«Cambios sin guardar»** con tres opciones: *Cancelar*, *Salir sin guardar* y *Guardar y salir*.

### Entrar dentro de un módulo

**Doble click** sobre un módulo de backend o frontend abre la **vista interna (Deep Dive)** descrita en la sección siguiente.

---

## 3.6. Vista interna del módulo (Deep Dive)

### Descripción

El **Deep Dive** (`/diagrams/:id/modules/:moduleId`) muestra el interior de un módulo concreto: sus carpetas, sus archivos en formato UML y los enlaces con módulos y pantallas relacionados.

Solo se puede entrar en módulos de **backend** o **frontend**.

### Componentes del canvas interno

- **Cabeceras de carpeta** estilo etiqueta para agrupar archivos.
- **Nodos de archivo (FileNode)** con su nombre y una lista de **funciones** dentro del archivo.
- **Nodos *frontier*** en los bordes que representan:
  - Pantallas vinculadas al módulo (modo frontend).
  - Otros módulos relacionados.
- **Toolbar superior** con: botón **Volver**, **Undo / Redo**, **Guardar**, toggle **Relaciones / Flujos**.

### Modo Relaciones (Deep Dive)

Muestra:

- `file.imports` → flechas entre archivos del módulo.
- Vinculación pantalla ↔ archivo (en módulos frontend).

### Modo Flujos (Deep Dive)

Si seleccionas un flujo que pasa por este módulo, el Deep Dive lo dibuja como una **secuencia numerada** entre los archivos y funciones implicados.

### Pasos detallados

1. En el visor de diagrama, haz **doble click** sobre un módulo de backend o frontend.
2. Se abre el Deep Dive del módulo.
3. Para volver al diagrama general, pulsa el botón **«Volver»** de la cabecera.

---

## 3.7. Asistente IA

### Descripción

El **Asistente IA** (`/bot`) es un chatbot integrado que genera por ti la carpeta `app-doc/` lista para subir al generador de diagramas.

Está pensado para usuarios que **no quieren aprender el formato Markdown de CodeAtlas**. Tú describes tu aplicación en lenguaje natural y el bot redacta los archivos correctos, los valida y te los entrega en un `.zip`.

### Layout en tres columnas

- **Izquierda — Conversaciones:** lista de todas tus sesiones. Cada sesión es una conversación independiente con su propio historial y sus propios archivos.
- **Centro — Chat:** mensajes del usuario y del bot, selector de modelo (`Flash` / `Pro`), campo de entrada con autoexpansión y botón **«Enviar»**.
- **Derecha — Archivos generados:** árbol con la estructura `app-doc/` actual y vista previa de cada archivo seleccionado.

### Modos de trabajo del bot

El bot puede operar de dos formas:

1. **Modo entrevista:** te hace preguntas paso a paso para construir la documentación.
2. **Modo transformación:** le describes tu aplicación de golpe y él convierte la descripción en archivos.

Si no le indicas cuál prefieres, te lo pregunta al inicio de la conversación.

### Pasos detallados

**Crear una conversación nueva:**

1. Entra en el Asistente IA desde el Dashboard.
2. Pulsa **«+ Nueva»** en la columna de Conversaciones.
3. Empieza a chatear.

**Generar la documentación:**

1. Cuéntale al bot qué hace tu aplicación, o pídele que te haga preguntas.
2. El bot irá generando archivos `.md` en la columna derecha.
3. Cada vez que selecciones un archivo del árbol, su contenido aparece debajo en una vista previa.

**Descargar el `.zip`:**

1. Cuando la documentación esté completa, pulsa **«Descargar zip»** en la cabecera.
2. El navegador descarga `app-doc.zip` con la estructura lista para subir al generador de diagramas.

**Borrar archivos individuales o conversaciones enteras:**

- En el árbol de archivos, pasa el ratón sobre un archivo y pulsa el icono de papelera.
- En la lista de Conversaciones, pulsa el icono de papelera de la sesión correspondiente. Se pide confirmación.

### Selector de modelo

En la cabecera del chat hay un selector entre **«Flash»** (más rápido, cuota diaria menor) y **«Pro»** (más capaz, cuota más amplia). Si agotas la cuota diaria de un modelo, la aplicación lo detecta y muestra una **tarjeta amarilla** con la opción **«Cambiar a [modelo] y reintentar»**.

### Persistencia

- La **conversación activa** se guarda en `localStorage`. Al recargar el navegador vuelves a la misma sesión.
- El **modelo seleccionado** también se persiste.
- El historial y los archivos están **vinculados a tu usuario** en la base de datos.

### Avisos de validación

Si el bot genera un archivo con un error de formato (por ejemplo referencias a IDs inexistentes), aparece una **caja amarilla** con los avisos para que pidas al bot corregirlo.

---

## 3.8. Configuración de usuario

### Descripción

La pantalla de Configuración (`/settings`) está organizada en tres pestañas verticales accesibles desde un menú lateral.

### Pestaña «Perfil»

- **Avatar:** con tus iniciales (basadas en tu nombre).
- **Botón «Cambiar foto»:** JPG o PNG, máximo 2 MB.
- **Campo «Nombre»:** editable.
- **Campo «Email»:** editable.
- **Botón «Guardar cambios»** con confirmación verde al guardar.

### Pestaña «Contraseña»

- **Contraseña actual.**
- **Nueva contraseña** (mínimo 8 caracteres).
- **Confirmar nueva contraseña.**
- **Botón «Actualizar contraseña»** habilitado solo si las dos nuevas coinciden y la actual está rellenada.

### Pestaña «Preferencias»

- **Tema:** segmentado entre **«Claro»** y **«Oscuro»**. También se puede cambiar desde la cabecera global.

### Cómo acceder

- **Topbar → icono ⚙️ Configuración**, o
- **Topbar → avatar → «Mi cuenta»**.

---

\pagebreak

# 4. Procedimientos paso a paso

## 4.1. Tareas comunes

### 4.1.1. Crear tu primer diagrama desde cero (sin archivos previos)

1. Inicia sesión en CodeAtlas.
2. Pulsa **«Nuevo proyecto»** y rellena nombre + descripción.
3. En la vista de proyecto, pulsa **«Asistente IA»** desde el Dashboard.
4. Pulsa **«+ Nueva»** para crear una conversación.
5. Cuéntale al bot qué hace tu app. Ejemplo:
   > *«Tengo una app de gestión de gimnasios. Hay un módulo de auth (login, registro), un módulo de socios (alta, baja, ver listado) y un módulo de clases (reservar, cancelar). El frontend tiene una pantalla de login, una de socios y una de clases. La BD tiene tablas users, members y classes.»*
6. Cuando termine de generar todos los archivos, pulsa **«Descargar zip»**.
7. Descomprime el `.zip` en tu ordenador.
8. Vuelve al Dashboard y entra en tu proyecto.
9. Pulsa **«Nuevo diagrama»** y arrastra **toda la carpeta `app-doc/`** sobre la zona de subida.
10. Pulsa **«Generar diagrama»**.

### 4.1.2. Actualizar un diagrama existente

1. Modifica tus archivos `.md` en local.
2. Entra en el proyecto y abre el diagrama actual.
3. Si quieres mantener el actual y crear uno nuevo: vuelve al proyecto y pulsa **«Nuevo diagrama»**.
4. Si quieres sobreescribir: borra el diagrama actual desde su modal de edición y crea uno nuevo con el mismo nombre.

### 4.1.3. Reorganizar visualmente un diagrama

1. Abre el diagrama.
2. Arrastra cada nodo a la posición que prefieras.
3. Usa **Ctrl+Z** para deshacer cualquier movimiento que no te convenza.
4. Pulsa **«Guardar»** cuando estés satisfecho.

### 4.1.4. Compartir el diagrama con un compañero

> **AVISO:** CodeAtlas en su versión actual no incluye colaboración multiusuario sobre el mismo proyecto. Para compartir resultados:

1. Realiza una captura de pantalla del visor (`Win + Shift + S` en Windows, `⌘ + Shift + 4` en macOS).
2. O bien comparte los archivos `.md` originales, y el compañero podrá generar el mismo diagrama en su cuenta.

### 4.1.5. Cambiar tu contraseña

1. Topbar → avatar → **«Mi cuenta»**.
2. Selecciona la pestaña **«Contraseña»**.
3. Rellena los tres campos.
4. Pulsa **«Actualizar contraseña»**.

### 4.1.6. Cambiar el tema (claro / oscuro)

- **Vía rápida:** Topbar → botón **sol / luna**.
- **Vía Configuración:** ⚙️ → **Preferencias** → selecciona **Claro** u **Oscuro**.

## 4.2. Casos de uso

### Caso 1: Documentar un proyecto fin de curso

Eres estudiante de DAW y necesitas entregar la documentación de tu proyecto.

1. Crea un proyecto **«TFC Lumen Analytics»**.
2. Usa el Asistente IA para generar la carpeta `app-doc/` describiendo tu app.
3. Sube los archivos y genera el diagrama.
4. Reorganiza los nodos para que sean legibles.
5. Guarda el *layout* y haz capturas de cada modo (Relaciones y Flujos).
6. Incluye las capturas en tu Memoria del Proyecto.

### Caso 2: Onboarding de un nuevo miembro del equipo

1. Genera el diagrama de tu aplicación una vez con todos los módulos.
2. Comparte con el nuevo miembro el enlace al diagrama o las capturas.
3. El nuevo miembro puede usar el **modo Flujos** para entender de un vistazo cómo funciona el *login*, cómo se crea un pedido, etc.

### Caso 3: Refactor de una aplicación legacy

1. Crea un proyecto **«Sistema legacy»**.
2. Genera un primer diagrama llamado **«Estado actual»** con la arquitectura tal y como está.
3. Después del refactor, genera un nuevo diagrama llamado **«Tras refactor»**.
4. Compara los dos en la lista de diagramas del proyecto.

### Mejores prácticas

- **Documenta un solo nivel a la vez.** No mezcles módulos genéricos y submódulos en el mismo `app-doc/`.
- **Usa IDs descriptivos en minúsculas con guiones.** Por ejemplo `auth-backend`, no `AuthBackend1`.
- **Mantén los flujos cortos.** Idealmente 5-8 pasos por flujo. Si un flujo tiene 20 pasos, probablemente sean dos flujos distintos.
- **Guarda con frecuencia.** El historial es local; si cierras el navegador antes de guardar, pierdes el reordenamiento.

---

\pagebreak

# 5. Resolución de problemas

## 5.1. Problemas comunes

### Problema: No puedo iniciar sesión

**Causas posibles:**

- Email o contraseña incorrectos.
- La cuenta no existe.
- Sesión previa caducada.

**Soluciones:**

1. Verifica que escribes el email exactamente como lo registraste.
2. Comprueba que no esté activo el **bloqueo de mayúsculas**.
3. Si no recuerdas la contraseña, contacta con tu administrador (en la versión actual no hay recuperación automática por email).
4. Si aún no tienes cuenta, pulsa **«Crear cuenta»**.

### Problema: No se genera el diagrama tras subir los archivos

**Causas posibles:**

- Los archivos no llevan **frontmatter YAML** (`---` al principio y al final).
- Falta el archivo índice `01-modules.md`.
- Las referencias entre archivos apuntan a IDs que no existen.

**Soluciones:**

1. Asegúrate de que cada archivo `.md` empieza con un bloque `---` con metadatos.
2. Comprueba que el archivo `01-modules.md` está en la raíz de `app-doc/`.
3. Revisa los avisos amarillos del bot (si lo usaste) y corrige las referencias inválidas.
4. Como atajo, usa **«cargar muestra»** para verificar que tu instalación funciona y luego compara tu estructura con la de la muestra.

### Problema: El diagrama se ve desordenado

**Causa:** El *layout* automático no siempre acierta con diagramas muy grandes.

**Solución:**

1. Arrastra los nodos manualmente.
2. Usa **Ctrl+Z** para deshacer movimientos.
3. Pulsa **«Guardar»** para persistir el nuevo *layout*.

### Problema: El Asistente IA dice «Límite diario alcanzado»

**Causa:** Has consumido la cuota gratuita diaria del modelo seleccionado.

**Solución:**

- Pulsa **«Cambiar a [otro modelo] y reintentar»** en la tarjeta amarilla.
- O espera al siguiente día (la cuota se renueva a las 09:00, hora peninsular).

### Problema: He perdido el botón «Guardar» del diagrama

**Causa:** El botón está deshabilitado cuando **no hay cambios pendientes**.

**Solución:** Reordena cualquier nodo y verás que el botón se activa. Si no quieres guardar nada, pulsa **Ctrl+Z** las veces que necesites para volver al estado base.

### Problema: La carpeta no se sube por drag & drop en Safari

**Causa:** Safari no soporta totalmente el atributo `webkitdirectory`.

**Solución:** Usa el botón **«Archivos»** y selecciona los `.md` uno a uno. O usa Chrome / Firefox.

### Problema: No veo todos los nodos del diagrama

**Causas posibles:**

- Tienes un filtro de tipo de bloque desactivado.
- Hay un nodo bloqueado por la búsqueda.
- Las relaciones indirectas están ocultas.

**Soluciones:**

1. Abre la **toolbar superior** y verifica que todos los chips de capa estén activos.
2. Pulsa **«Salir de foco»** si hubiera un nodo bloqueado.
3. Activa el toggle de **relaciones indirectas**.

---

## 5.2. Preguntas Más Frecuentes (PMF)

### General

**¿Necesito instalar algo para usar CodeAtlas?**
No. CodeAtlas es una aplicación web. Solo necesitas un navegador moderno.

**¿Mis datos son privados?**
Sí. Cada usuario solo ve sus propios proyectos. Los archivos `.md` originales no se almacenan en servidor: solo el JSON resultante del análisis.

**¿Puedo usar CodeAtlas sin conexión?**
No en la versión actual. La aplicación requiere conexión con el backend para parsear los archivos y para el Asistente IA.

### Sobre los proyectos y diagramas

**¿Cuántos proyectos puedo crear?**
No hay un límite explícito en la versión actual.

**¿Puedo mover un diagrama de un proyecto a otro?**
No directamente. Como solución alternativa, crea el diagrama de nuevo en el proyecto destino.

**¿Por qué un proyecto puede tener varios diagramas?**
Para que puedas representar el mismo sistema desde distintos enfoques o en distintos momentos (planificación, estado actual, tras refactor, etc.).

### Sobre los archivos Markdown

**¿Tengo que aprender el formato `app-doc/`?**
No es obligatorio. Si prefieres no aprenderlo, usa el **Asistente IA** y deja que él los genere por ti.

**¿Puedo añadir secciones extra en los `.md`?**
Sí. El parser tolera secciones que no estén en el formato estándar; las incluye como extensiones y no fallan.

**¿Qué pasa si dos archivos tienen el mismo ID?**
El parser puede fallar o sobrescribir uno. Los IDs deben ser únicos dentro de su tipo.

### Sobre el Asistente IA

**¿Qué diferencia hay entre Flash y Pro?**

- **Flash:** respuestas más rápidas, cuota diaria más reducida.
- **Pro:** mayor capacidad de razonamiento, cuota diaria más amplia. Recomendado para aplicaciones complejas.

**¿Se guarda mi historial de conversación?**
Sí. Cada sesión guarda su propio historial y sus archivos generados. Puedes volver a una conversación días después y continuarla.

**¿Puedo tener varias conversaciones en paralelo?**
Sí. Cada sesión es independiente. Crea tantas como necesites desde **«+ Nueva»**.

### Sobre la interfaz

**¿Cómo activo el modo oscuro?**
Topbar → icono **luna** o **sol**, o desde **Configuración → Preferencias**.

**¿Cómo deshago un movimiento?**
**Ctrl+Z** dentro del visor de diagrama o del Deep Dive.

**¿El zoom y el pan funcionan con rueda del ratón?**
Sí. La rueda hace zoom y el botón central permite hacer *pan* (arrastrar el lienzo).

---

\pagebreak

# 6. Recursos adicionales

## 6.1. Soporte

### Cómo obtener ayuda

Si encuentras un problema que no aparece en este manual:

1. **Revisa el capítulo 5** (Resolución de problemas).
2. **Consulta el glosario** (capítulo 7) si hay un término que no entiendes.
3. **Contacta con el autor del proyecto:**
   - **Email:** izanmg2706@gmail.com
   - **Asunto sugerido:** `[CodeAtlas] Descripción breve del problema`

### Información de contacto

| Canal | Datos |
|---|---|
| Email principal | izanmg2706@gmail.com |
| Repositorio | (interno del proyecto de síntesis) |

### Horario de atención

Al tratarse de un proyecto académico, no hay un horario formal de atención. Las consultas se responden lo antes posible en horario lectivo.

### Canales de soporte disponibles

- **Email** (canal principal).
- **Sesiones presenciales** durante el curso para los compañeros del centro.

## 6.2. Recursos complementarios

### Documentación relacionada

CodeAtlas se entrega como Proyecto de Síntesis de DAW. Junto a este manual existen otros dos documentos oficiales:

- **Manual técnico:** detalla la arquitectura interna, el stack, las decisiones de diseño y la API.
- **Memoria del proyecto:** describe el proceso de desarrollo, las pruebas realizadas y las conclusiones.

### Recursos internos del proyecto

Dentro del repositorio del proyecto encontrarás carpetas pensadas como referencia para entender el formato esperado por la herramienta:

- `estructura-proyecto/`: decisiones de arquitectura y diseño por bloques.
- `aplicacion/ia-doc/`: especificación detallada del formato `app-doc/` (la misma que utiliza el Asistente IA).
- `aplicacion/docs/`: documentación interna de desarrollo.

### Enlaces útiles

- [Documentación oficial de Markdown](https://www.markdownguide.org/)
- [Vue Flow (motor de diagramas usado)](https://vueflow.dev/)
- [DBML — Lenguaje usado en `## Table`](https://dbml.dbdiagram.io/)
- [Lucide Icons (iconografía)](https://lucide.dev/)

### Comunidad de usuarios

CodeAtlas es un proyecto académico individual; la **comunidad de usuarios** todavía no existe formalmente. Si quieres contribuir o aportar sugerencias, escribe al email de contacto del capítulo 6.1.

---

\pagebreak

# 7. Glosario

| Término | Definición |
|---|---|
| **API** | *Application Programming Interface.* Conjunto de endpoints que el backend expone para que el frontend los consuma. |
| **app-doc/** | Carpeta de documentación con el formato esperado por CodeAtlas. |
| **Backend** | Parte servidor de una aplicación: lógica, BD, API. |
| **Breadcrumb** | Miga de pan. Indicador de navegación que muestra la ruta jerárquica desde la raíz. |
| **Canvas** | Lienzo donde se dibuja el diagrama interactivo. |
| **Capa** | Clasificación de un nodo: `backend`, `frontend`, `screen`, `database`, `rules`. |
| **CFGS** | Ciclo Formativo de Grado Superior. |
| **CTA** | *Call to Action.* Botón principal de una pantalla. |
| **DAW** | Desarrollo de Aplicaciones Web (ciclo formativo). |
| **DBML** | *Database Markup Language.* Lenguaje para describir tablas y relaciones de BD. Se usa dentro de la sección `## Table` de las entidades. |
| **Deep Dive** | Vista interna de un módulo concreto, estilo UML. |
| **Drag & Drop** | Arrastrar y soltar archivos sobre una zona habilitada. |
| **Entidad** | Tabla o estructura persistida en BD. |
| **Flujo** | Secuencia de pasos que recorre módulos, pantallas y BD. |
| **Frontend** | Parte cliente de una aplicación: lo que se ve en el navegador. |
| **Frontmatter** | Bloque de metadatos YAML al inicio de un archivo `.md`, delimitado por `---`. |
| **ID** | Identificador único de un elemento. En minúsculas con guiones. |
| **Layout** | Disposición espacial de los nodos en el canvas. |
| **Markdown (.md)** | Lenguaje de marcado ligero usado para describir la documentación. |
| **Mini-mapa** | Vista en miniatura del canvas en la esquina inferior derecha. |
| **MVP** | *Minimum Viable Product.* Versión mínima funcional del proyecto. |
| **Nodo** | Bloque visible dentro de un diagrama. |
| **Pantalla** | Vista o página dentro del frontend documentado. |
| **Pin** | Fijar un proyecto para que aparezca en la sección «Fijados» del Dashboard. |
| **Proyecto** | Entidad contenedora principal en CodeAtlas; agrupa diagramas. |
| **Sesión** | Conversación con el Asistente IA. Cada usuario puede tener varias. |
| **SidePanel** | Panel lateral derecho con el detalle de un nodo. |
| **Snapshot** | Foto del estado de posiciones del diagrama usada para Undo/Redo. |
| **TFC** | Trabajo Fin de Ciclo. |
| **Topbar** | Cabecera fija de la aplicación. |
| **UML** | *Unified Modeling Language.* Notación estándar para diagramas de software. |
| **YAML** | Lenguaje de serialización usado en el frontmatter. |

---

\pagebreak

# 8. Índice alfabético

**A**
- Asistente IA · 3.7
- Avatar · 3.2, 4.1.5
- Atajos de teclado · 2.2

**B**
- Backend · 3.5, 7
- Borrar diagrama · 3.3
- Buscar nodo · 3.5

**C**
- Cambiar contraseña · 4.1.5
- Cambiar tema · 4.1.6
- Canvas · 3.5, 7
- Conexiones (continuas e indirectas) · 3.5
- Configuración · 3.8
- Conversaciones (IA) · 3.7
- Cuota diaria del bot · 3.7, 5.1
- Crear proyecto · 3.2, 4.1.1

**D**
- Dashboard · 3.2
- Deep Dive · 3.6
- Descargar zip · 3.7, 4.1.1
- Drag & drop · 3.4, 5.1

**E**
- Editar diagrama · 3.3
- Email de soporte · 6.1
- Entidades de BD · 3.5, 7

**F**
- Filtros del canvas · 3.5
- Flash (modelo IA) · 3.7
- Flujos (modo) · 3.5
- Frontmatter · 5.1, 7

**G**
- Glosario · 7
- Guardar layout · 3.5

**H**
- Historial undo/redo · 3.5, 3.6

**I**
- Iconos · prefacio
- Inicio de sesión · 1.5, 3.1

**L**
- Layout · 3.5, 7
- Leyenda · 3.5
- Logout · 3.1

**M**
- Markdown · 1.1, 7
- Mini-mapa · 3.5
- Modal «Cambios sin guardar» · 3.5
- Módulos · 3.5, 3.6, 7

**N**
- Navegadores · 1.4
- Nodos · 3.5, 7
- Nuevo diagrama · 3.4
- Nuevo proyecto · 3.2

**P**
- Panel lateral · 3.5
- Pantallas · 3.5, 7
- Perfil · 3.8
- Pin (fijar proyecto) · 3.2
- Preferencias · 3.8
- Preguntas frecuentes · 5.2
- Pro (modelo IA) · 3.7
- Problemas comunes · 5.1
- Proyectos · 3.2, 3.3

**R**
- Recursos · 6
- Registrarse · 1.5, 3.1
- Reglas del sistema · 3.5
- Relaciones (modo) · 3.5
- Requisitos · 1.3

**S**
- Salir de foco · 3.5
- Soporte · 6.1

**T**
- Tema claro / oscuro · 3.8, 4.1.6
- Topbar · 2.4, 7

**U**
- Undo / Redo · 2.2, 3.5

**V**
- Visor de diagrama · 3.5
- Visión general · 1.1

**Y**
- YAML · 5.1, 7

---

\pagebreak

# Contraportada

**CodeAtlas — Manual de Usuario**

*De la documentación al diagrama: la arquitectura de tu aplicación, visible.*

**Versión del manual:** 1.0 · **Fecha:** 19 de mayo de 2026

Este manual forma parte del **Proyecto de Síntesis del CFGS Desarrollo de Aplicaciones Web (DAW)** del curso 2025-2026.

Para sugerencias, erratas o ampliaciones de este manual, contactar con el autor en:

**izanmg2706@gmail.com**

© 2026 · CodeAtlas · Todos los derechos reservados al autor del proyecto académico.
