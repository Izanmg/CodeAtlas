# Prompt para Claude Design — CodeAtlas UI

---

## Qué es CodeAtlas

CodeAtlas es una herramienta web para equipos de desarrollo. Permite documentar la arquitectura de una aplicación mediante archivos Markdown y visualizarla como diagramas interactivos.

El flujo de uso es:

1. El usuario crea un proyecto en CodeAtlas
2. Dentro del proyecto puede generar varios diagramas
3. Para crear un diagrama, sube sus archivos `.md` de documentación desde su escritorio
4. El backend los transforma en un modelo JSON estructurado
5. La interfaz recibe ese JSON y lo renderiza como un diagrama visual interactivo de la arquitectura

**Por qué es útil:** el objetivo es que cualquier persona — desarrollador nuevo, tech lead, arquitecto — pueda entender la estructura completa de una aplicación con solo abrir el diagrama. De un vistazo debe verse qué módulos existen, cómo se relacionan entre sí, qué pantallas forman parte de qué módulo, qué tablas de base de datos usa cada parte del sistema y cómo fluye la información de extremo a extremo. Es una alternativa visual a leer decenas de archivos de código: la arquitectura de la aplicación representada como un mapa navegable.

---

## Lo que necesito

Prototipos de alta fidelidad interactivos de todas las pantallas de la aplicación, más la identidad visual completa (logo + paleta de colores).

Cuando el diseño esté validado, necesitaré un **handoff** para que otro agente (Claude Code) lo implemente en Vue 3 + Tailwind. Al final de este documento está el apartado de handoff con las instrucciones exactas de cómo prepararlo.

---

## Identidad visual

### Nombre
La aplicación se llama **CodeAtlas**. El nombre debe aparecer en la cabecera, en el login y en el logo. "Atlas" hace referencia a un atlas geográfico — aquí aplicado al código: un mapa de la arquitectura de una aplicación.

### Logo
Diseña un logo para CodeAtlas y expórtalo como **PNG**. Debe transmitir la idea de mapa, estructura y código. Puede combinar elementos como nodos conectados, rutas, capas o una cuadrícula técnica — algo que evoque tanto un diagrama de arquitectura como un atlas cartográfico. Debe funcionar en fondos oscuros y claros, y ser legible en tamaños pequeños (favicon) y grandes (pantalla de login).

Crea dos versiones:
- **Versión completa**: icono + nombre "CodeAtlas" en horizontal
- **Versión icono**: solo el símbolo, sin texto

### Paleta de colores
Define la paleta principal de CodeAtlas. El diseño debe ser acorde con lo que representa: una herramienta técnica orientada a desarrolladores, pero con carácter visual fuerte porque su función principal es representar información de forma gráfica.

La paleta debe incluir:
- Color primario (dominante, botones principales, acentos)
- Color secundario o de acento (elementos interactivos, badges, estados)
- Fondos oscuro y claro (la app puede ser principalmente oscura, es una herramienta de desarrollador)
- **Colores semánticos para los tipos de nodo del diagrama** — este es el punto más importante de la paleta, porque el diagrama tiene seis tipos de elemento y cada uno debe ser visualmente distinguible:
  - Módulo backend
  - Módulo frontend
  - Pantalla
  - Entidad de base de datos
  - Flujo
  - Reglas del sistema
- Colores de estado: error, éxito, advertencia

---

## Pantallas a diseñar

### 1. Login y registro

Pantallas de acceso estándar. Diseño limpio y centrado, con el logo y nombre de CodeAtlas. Login: email y contraseña. Registro: nombre, email y contraseña.

---

### 2. Dashboard

Vista principal del usuario autenticado:
- Saludo con el nombre del usuario
- Grid de tarjetas de proyectos: nombre, descripción breve, número de diagramas, fecha de última modificación
- Botón destacado para crear un proyecto nuevo
- Navegación con acceso a Dashboard y Configuración

**Proyecto por defecto:** Debe haber un proyecto ya creado llamado **"CodeAtlas"** con descripción *"Arquitectura de la propia aplicación CodeAtlas"*. Contiene un diagrama ya generado. Sirve como demostración de lo que produce la herramienta.

Los datos del dashboard (proyectos, usuario) van hardcodeados en una variable JS separada del markup, no inline en el HTML.

---

### 3. Crear proyecto

Formulario simple:
- Nombre del proyecto (obligatorio)
- Descripción (opcional)
- Botones de crear y cancelar

---

### 4. Detalle de proyecto

Vista de un proyecto concreto:
- Nombre y descripción
- Tarjetas de diagramas generados: nombre, fecha, miniatura o vista previa estática
- Botón para generar un nuevo diagrama
- Botón para volver al dashboard

El proyecto **"CodeAtlas"** tiene un diagrama ya visible aquí.

---

### 5. Crear diagrama — subida de archivos

Pantalla donde el usuario sube sus `.md` para generar un diagrama:
- Zona de drag & drop grande y visual con instrucciones claras
- Lista de archivos seleccionados con opción de eliminar cada uno
- Campo para nombrar el diagrama
- Botón principal "Generar diagrama"
- Estado de carga (spinner o progress)
- Estado de error con mensaje

Los estados de carga y error pueden ser interactivos en el prototipo (botón que los activa).

---

### 6. Vista del diagrama — la pantalla más importante

Canvas interactivo que renderiza la arquitectura de una aplicación a partir del JSON del backend.

#### El JSON que recibe el diagrama

```json
{
  "modules": {
    "backend": [
      {
        "id": "auth-backend",
        "name": "Authentication",
        "description": "Handles user identity and session management",
        "layer": "backend",
        "api": ["POST /auth/login", "POST /auth/register", "GET /auth/me"],
        "database": ["users"],
        "dependsOn": [],
        "functions": {
          "auth-controller": ["login()", "register()"],
          "auth-service": ["validateSession()", "hashPassword()"]
        },
        "files": [
          { "id": "auth-controller", "path": "auth.controller.js", "type": "controller" },
          { "id": "auth-service", "path": "auth.service.js", "type": "service" }
        ],
        "extensions": {}
      }
    ],
    "frontend": [
      {
        "id": "auth-frontend",
        "name": "Auth Views",
        "description": "Handles the login and registration UI",
        "layer": "frontend",
        "screens": ["login", "register"],
        "consumesApi": ["auth-backend"],
        "dependsOn": [],
        "state": ["currentUser", "isAuthenticated"],
        "functions": {},
        "extensions": {}
      }
    ]
  },
  "screens": [
    {
      "id": "login",
      "name": "Login",
      "description": "Entry point for unauthenticated users",
      "module": "auth-frontend",
      "requiresAuth": false,
      "routes": ["/login"],
      "navigatesTo": ["dashboard"],
      "elements": ["username input", "password input", "submit button"],
      "actions": ["submit-login", "go-to-register"],
      "extensions": {}
    }
  ],
  "flows": [
    {
      "id": "user-login",
      "name": "User Login",
      "description": "From form submission to dashboard",
      "trigger": "user submits login form",
      "screens": ["login", "dashboard"],
      "modules": ["auth-frontend", "auth-backend"],
      "database": ["users"],
      "steps": [
        "User enters credentials",
        "Frontend calls POST /auth/login",
        "Backend validates and returns token",
        "Frontend redirects to dashboard"
      ],
      "errorCases": ["Invalid credentials: show error on login screen"],
      "extensions": {}
    }
  ],
  "database": [
    {
      "id": "users",
      "name": "User",
      "description": "Stores registered user accounts",
      "usedBy": ["auth-backend"],
      "relations": [{ "target": "projects", "type": "one-to-many", "field": "user_id" }],
      "table": "Table users {\n  id uuid [pk]\n  username varchar [not null]\n  password_hash varchar [not null]\n}",
      "extensions": {}
    }
  ],
  "systemRules": {
    "auth": ["All routes require authentication except /login and /register"],
    "navigation": ["Unauthenticated users redirect to /login"],
    "conventions": ["API responses use camelCase"],
    "extensions": {}
  }
}
```

#### Cómo representar cada tipo de elemento

| Tipo de nodo | Qué representa | Qué muestra |
|---|---|---|
| **Módulo backend** | Módulo del servidor | Nombre, capa, endpoints de API, entidades de BD que usa |
| **Módulo frontend** | Módulo del cliente | Nombre, capa, pantallas que contiene, APIs que consume |
| **Pantalla** | Una vista de la interfaz | Nombre, ruta URL, si requiere auth |
| **Entidad de BD** | Una tabla | Nombre, campos principales |
| **Flujo** | Un proceso de principio a fin | Nombre, trigger, pasos resumidos |
| **Reglas del sistema** | Contexto global | Reglas de auth, navegación, convenciones |

#### Conexiones entre nodos

- Módulo frontend → módulo backend (cuando `consumesApi` lo referencia)
- Módulo frontend → pantallas que contiene (`screens`)
- Módulo backend → entidades de BD que usa (`database`)
- Pantalla → pantalla (navegación: `navigatesTo`)
- Flujo → todos los elementos que toca (módulos, pantallas, entidades)

#### UX del canvas

- Canvas que ocupa la mayor parte de la pantalla
- Nodos arrastrables
- Zoom in/out
- Clic en un nodo abre un panel lateral con el detalle completo del elemento
- Barra de herramientas con filtros para mostrar/ocultar tipos de nodo
- Panel de leyenda con colores y tipos
- Cabecera con nombre del diagrama y botón de volver al proyecto

#### El diagrama del proyecto "CodeAtlas"

El diagrama por defecto del proyecto "CodeAtlas" debe mostrar la arquitectura de la propia app. Los datos van hardcodeados en una variable JS separada del markup. Debe incluir:
- El módulo parser (backend) con sus endpoints
- Los módulos frontend planificados (auth, dashboard, projects, diagrams, settings)
- Las entidades de BD previstas
- Las pantallas principales

---

### 7. Configuración de cuenta

Página de ajustes con navegación lateral interna:
- **Perfil**: nombre, email, avatar placeholder, guardar
- **Contraseña**: contraseña actual, nueva, confirmación
- **Preferencias** (opcional): tema, idioma

---

## Handoff para Claude Code

Cuando el diseño esté validado, prepara un paquete de handoff con esta información para que Claude Code lo implemente en **Vue 3 + Tailwind CSS**:

### Design tokens
Todos los valores de la paleta expresados como variables CSS (`--color-primary`, etc.) y como colores personalizados de Tailwind (`extend.colors` en `tailwind.config.js`). Incluye también tipografía, espaciados y radios de borde si los has definido.

### Estructura de componentes
Para cada pantalla, una lista de los componentes que la componen, su jerarquía, las props que reciben y los estados posibles (hover, loading, error, empty, etc.).

### Estructura de carpetas Vue a seguir
```
frontend/src/
├── modules/
│   ├── dashboard/
│   │   └── views/DashboardView.vue
│   ├── projects/
│   │   ├── views/
│   │   │   ├── ProjectsNewView.vue
│   │   │   └── ProjectDetailView.vue
│   │   ├── stores/projects.store.js
│   │   └── services/projects.service.js
│   ├── diagrams/
│   │   ├── views/
│   │   │   ├── DiagramNewView.vue
│   │   │   └── DiagramView.vue
│   │   ├── components/
│   │   └── services/diagrams.service.js
│   ├── auth/
│   │   ├── views/
│   │   │   ├── LoginView.vue
│   │   │   └── RegisterView.vue
│   │   └── services/auth.service.js
│   └── settings/
│       ├── views/SettingsView.vue
│       └── services/settings.service.js
├── components/
├── router/index.js
├── App.vue
└── main.js
```

### Librerías recomendadas
Indica qué librerías ha usado el prototipo para cada funcionalidad y cuál sería su equivalente en Vue para la implementación real. En particular:
- Canvas de nodos del diagrama → **Vue Flow** (`@vue-flow/core`)
- Iconos → Lucide Vue o Heroicons
- Drag & drop de archivos → la librería que hayas usado o su equivalente Vue
- Cualquier otra librería del prototipo que necesite un equivalente Vue

### Notas de implementación
Cualquier decisión de diseño que no sea evidente desde los mockups: comportamientos de animación, lógica de filtros del canvas, estructura de datos esperada por los componentes, breakpoints usados.

### Assets exportados
- Logo en PNG (versión completa y versión icono)
- Cualquier ilustración o icono personalizado usado en las pantallas
