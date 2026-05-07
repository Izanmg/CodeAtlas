# Handoff: CodeAtlas — Frontend

## Overview

CodeAtlas is a tool that generates interactive architecture diagrams from a project's markdown documentation. The user uploads `.md` files describing modules / screens / database / system rules, and the app renders a navigable canvas where each block (backend module, frontend module, screen, database table, flow, rules) can be inspected in detail.

This handoff covers the **complete frontend** of the v1 product: auth, dashboard, project management, diagram generation, and the interactive diagram canvas.

## About the Design Files

The files inside `prototype/` are **design references created in HTML + React (via in-browser Babel)**. They are not production code to copy directly — they exist to show:

- The intended look (typography, spacing, colors, density, hierarchy)
- The intended behavior (navigation, hover states, side panel, focus mode, filters)
- The complete data shape and relationships used by the diagram canvas

**Your job is to recreate these designs in the target stack: Vue 3 + Tailwind CSS**, using Vue's idioms and Tailwind utility classes. The styling values are documented in this README so you don't need to reverse-engineer the prototype CSS.

For the diagram canvas specifically, use **Vue Flow** (https://vueflow.dev/) — the Vue port of React Flow, which is what the prototype uses. The data model, node anatomy, edge logic, layout algorithm and side-panel structure all map directly.

## Fidelity

**High-fidelity (hifi).** Pixel-perfect mockups with final colors, typography, spacing, borders, shadows, and interactions. Recreate every screen as designed; do not improvise the visual style.

---

## Tech Stack (target)

- **Vue 3** with `<script setup>` and Composition API
- **Tailwind CSS** (configured to use the design tokens listed below)
- **Vue Router** for navigation
- **Pinia** for state (auth, projects, current diagram)
- **Vue Flow** (`@vue-flow/core` + `@vue-flow/background` + `@vue-flow/controls` + `@vue-flow/minimap`) for the diagram canvas
- **VueUse** for utilities (useEventListener, useLocalStorage, useDark)
- **Lucide Vue Next** for icons (the prototype uses a custom Icon component but Lucide names map 1:1)
- HTTP client of your choice (the prototype hardcodes everything from `data.js`; in production, replace with API calls)

---

## Design Tokens

Add these to `tailwind.config.js` under `theme.extend`. They mirror `prototype/tokens.css` and support light + dark.

### Colors (light mode → dark mode)

| Token | Light | Dark | Use |
|---|---|---|---|
| `accent` | `#7c3aed` | `#a78bfa` | Primary brand (violet). CTAs, focus rings, active tabs. |
| `accent-hover` | `#6d28d9` | `#8b5cf6` | Hover state of primary buttons |
| `accent-soft` | `#f3efff` | `#1e1b2e` | Tinted bg for accent chips, callouts |
| `accent-fg` | `#ffffff` | `#0a0a0c` | Text on accent fill |
| `bg` | `#ffffff` | `#09090b` | Page background |
| `bg-subtle` | `#fafafa` | `#0c0c0f` | Section bg, table header |
| `bg-muted` | `#f4f4f5` | `#131317` | Hover / inactive chip bg |
| `bg-canvas` | `#fbfbfc` | `#0a0a0c` | Diagram canvas background |
| `surface` | `#ffffff` | `#131317` | Cards, side panel, nodes |
| `surface-raised` | `#ffffff` | `#18181c` | Modal, popover |
| `surface-overlay` | `#ffffff` | `#1c1c22` | Command palette |
| `border` | `#e4e4e7` | `#26262c` | Default border |
| `border-strong` | `#d4d4d8` | `#34343c` | Hover border, dividers |
| `border-subtle` | `#f0f0f1` | `#1c1c22` | Inner row separators |
| `fg` | `#09090b` | `#fafafa` | Primary text |
| `fg-muted` | `#52525b` | `#a1a1aa` | Body text, descriptions |
| `fg-subtle` | `#71717a` | `#71717a` | Labels, captions |
| `fg-faint` | `#a1a1aa` | `#52525b` | Placeholders, disabled |

### Semantic colors

| Token | Light fg | Light bg | Dark fg | Dark bg |
|---|---|---|---|---|
| `success` | `#16a34a` | `#f0fdf4` | `#22c55e` | `#052e16` |
| `warning` | `#d97706` | `#fffbeb` | `#fbbf24` | `#1f1608` |
| `danger`  | `#dc2626` | `#fef2f2` | `#f87171` | `#2d1010` |
| `info`    | `#2563eb` | `#eff6ff` | `#60a5fa` | `#0a1628` |

### Block-kind colors (used for diagram nodes + side panel)

| Kind | Light fg | Light bg | Dark fg | Dark bg |
|---|---|---|---|---|
| `backend`  | `#2563eb` (blue)   | `#eff6ff` | `#60a5fa` | `#0e1a2e` |
| `frontend` | `#16a34a` (green)  | `#f0fdf4` | `#4ade80` | `#0a1f12` |
| `screen`   | `#ea580c` (orange) | `#fff7ed` | `#fb923c` | `#2a160a` |
| `database` | `#9333ea` (purple) | `#faf5ff` | `#c084fc` | `#1e1228` |
| `flow`     | `#ca8a04` (amber)  | `#fefce8` | `#fcd34d` | `#261d08` |
| `rules`    | `#475569` (slate)  | `#f8fafc` | `#94a3b8` | `#15181d` |

### Typography

- Sans: **Inter** (`-apple-system, BlinkMacSystemFont, "Segoe UI"` fallback)
- Mono: **JetBrains Mono** (`"SF Mono", Menlo, Consolas` fallback) — used for routes, IDs, methods, code, labels in caps
- Display: Inter (no separate display family; the v2 system uses Inter throughout)

Body defaults: `font-size: 13px`, `line-height: 1.5`, `letter-spacing: -0.005em`. Enable Inter feature settings: `"cv11", "ss01", "ss03"`.

Type scale (no separate `text-*` config — use Tailwind defaults plus these specifics):

| Use | Size | Weight | Letter-spacing |
|---|---|---|---|
| Page title (h1) | 24–28px | 600 | -0.02em |
| Section header | 15–16px | 600 | -0.01em |
| Body | 13px | 400 | -0.005em |
| Small / caption | 12px | 400 | 0 |
| Mono label (uppercase) | 10–11px | 500 | 0.06em–0.08em |

### Radii
`xs: 3px · sm: 4px · md: 6px · lg: 8px · xl: 12px`

### Shadows
- `xs`: `0 1px 0 rgb(9 9 11 / 0.04)`
- `sm`: `0 1px 2px rgb(9 9 11 / 0.05), 0 0 0 1px rgb(9 9 11 / 0.04)`
- `md`: `0 4px 6px -1px rgb(9 9 11 / 0.06), 0 2px 4px -2px rgb(9 9 11 / 0.05)`
- `lg`: `0 10px 24px -6px rgb(9 9 11 / 0.10), 0 0 0 1px rgb(9 9 11 / 0.05)`
- `xl`: `0 20px 40px -12px rgb(9 9 11 / 0.18), 0 0 0 1px rgb(9 9 11 / 0.06)`
- `focus`: `0 0 0 3px rgb(124 58 237 / 0.20)` (use for `focus-visible`)

### Spacing
Tailwind defaults are fine. The app is **dense** — most cards use 12–16px padding, not 24–32px. Page content max-width: 1200px (dashboard, project), 760px (auth, diagram-new), full-bleed (diagram canvas).

---

## Routing

| Path | Component | Auth |
|---|---|---|
| `/login` | `AuthLogin.vue` | no |
| `/register` | `AuthRegister.vue` | no |
| `/` | `Dashboard.vue` | yes |
| `/projects/new` | `ProjectNew.vue` | yes |
| `/projects/:id` | `ProjectDetail.vue` | yes |
| `/projects/:id/diagrams/new` | `DiagramNew.vue` | yes |
| `/diagrams/:id` | `DiagramView.vue` | yes |
| `/settings` | `Settings.vue` | yes |

Unauthenticated visits to authed routes → redirect to `/login`. After login → redirect to `/`.

---

## Global Layout

For all authed routes, render an `<AppTopbar>` at the top (height **48px**, `border-bottom: 1px solid border`, `bg-surface`):

- Left: monogram logo + `CodeAtlas` wordmark + breadcrumb (e.g. `CodeAtlas / Lumen Analytics`)
- Center: search input ("Buscar proyectos, diagramas…", `Cmd+K` opens the command palette)
- Right: theme toggle (sun/moon icon), avatar with initials, dropdown to `Settings` and `Logout`

Auth routes (`/login`, `/register`) and the diagram canvas (`/diagrams/:id`) do **not** render the global topbar — they have their own chrome.

The page content lives below in a centered container (`max-w-[1200px] mx-auto px-8 pt-8 pb-16`).

### Logo (monogram)
A geometric `C` made of one open arc + one square dot:

```svg
<svg viewBox="0 0 24 24" width="20" height="20" fill="none">
  <path d="M19 6.5A8 8 0 1 0 19 17.5" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/>
  <rect x="14.5" y="10" width="3.5" height="3.5" rx="0.5" fill="currentColor"/>
</svg>
```

Color: `accent` for the icon when standing alone, `fg` when paired with the wordmark.

---

## Screens

### 1. AuthLogin / AuthRegister

**Layout**: Two columns. Left column (`flex-1`) holds the form, right column (`flex-1`, hidden < `lg`) holds a static SVG preview of a CodeAtlas diagram (3–4 dimmed nodes connected with thin edges, `bg-bg-subtle`).

**Form column** (centered, `max-w-[360px]`):
- Logo + wordmark at top
- Eyebrow (mono uppercase 10px, `fg-subtle`): `iniciar sesión` / `crear cuenta`
- Heading (24px, 600, -0.02em): `Bienvenido de vuelta` / `Crea tu cuenta`
- Description (13px, `fg-muted`): one short sentence
- Inputs: email, password (registration also: name, password confirm)
- Primary button full-width: `Entrar` / `Crear cuenta`
- Below: link to opposite screen (`¿No tienes cuenta? Crear una` / `¿Ya tienes cuenta? Entrar`)

**Behavior**: any non-empty email/password authenticates (mock). On submit → `/`.

### 2. Dashboard

**Top section** — stat strip (4 cells in a row, separated by vertical 1px borders, `border-subtle`):
- Total proyectos
- Total diagramas
- Última actualización (relative time)
- Plan actual (e.g. `Free · 2/5 proyectos`)

Each cell: mono uppercase label (10px, `fg-subtle`, tracking-wide) above big number (24px, 600).

**Page header**:
- Eyebrow: `panel general`
- Title: `Tus proyectos`
- Right side: `+ Nuevo proyecto` (primary button)

**Projects grid**: `grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4`. Each card:
- 1px border, `r-md`, `bg-surface`, padding 16px
- Pin icon top-right if `pinned`
- Project name (15px, 600), description (12px, `fg-muted`)
- Footer row (mono 11px, `fg-subtle`): `{N} diagramas · actualizado hace X`
- Hover: `border-color: border-strong`, `shadow-sm`
- Click → `/projects/:id`

**Recent diagrams feed** (below grid, 2-col layout `lg:grid-cols-[1fr_320px] gap-6`):
- Left: section header `Diagramas recientes` + list of last 5 diagrams as compact rows (icon · name · project name · time)
- Right: tip/onboarding card (e.g. "¿Primera vez? Crea un diagrama" with CTA)

### 3. ProjectNew

**Layout**: `max-w-[640px] mx-auto`. Page header (`crear proyecto` eyebrow, `Nuevo proyecto` title, description). Form:
- Field: nombre del proyecto (required)
- Field: descripción (textarea, 3 rows)
- Bottom row right-aligned: `Cancelar` (ghost) + `Crear proyecto` (primary)

### 4. ProjectDetail

**Layout**: `max-w-[1200px]`.

**Header**: breadcrumb (`Proyectos / {name}`), title (project name), description (`fg-muted`), actions row right (`Editar`, `Eliminar`, `+ Nuevo diagrama`).

**Body**: Two columns `lg:grid-cols-[1fr_300px] gap-8`.

Left:
- Section header `Diagramas` + count
- If no diagrams → empty state card: icon + "Aún no hay diagramas" + button `Generar primero`
- If diagrams exist → list of cards (one per diagram), each with name, description, created date, primary CTA `Abrir →` (link to `/diagrams/:id`)

Right (sticky `top-20`):
- "Detalles" card: created at, updated at, owner
- "Acciones rápidas" card with secondary actions

### 5. DiagramNew (file upload)

**Layout**: `max-w-[760px] mx-auto`.

**Page header**: eyebrow `generar diagrama`, title `Sube tu documentación`, description.

**Drop zone** (`border: 1.5px dashed border-strong`, `r-lg`, `bg-surface`, padding `44px 24px`, text-center, click-able):
- 40×40 rounded icon container (`bg-bg-muted` → `bg-accent` when dragging)
- Heading: `Arrastra tus archivos .md aquí`
- Subtext: `o haz clic para seleccionarlos · acepta varios archivos`
- Secondary button: `Seleccionar archivos`
- On drag-over: border becomes accent, bg becomes `accent-soft`

**File list** (after files dropped): bordered container `bg-surface r-md`, header row (`bg-bg-subtle`) with count + "Quitar todos" link, then one row per file (mono filename · size · ✕ remove button).

**Name field**: `Field` with mono input.

**Footer row**: left link `↳ cargar muestra` (loads 5 fake .md files), right `Cancelar` + `Generar diagrama` (primary, disabled until at least one file + name).

**Loading state** (replaces the form when generating):
- Centered card, `bg-surface`, `r-lg`, padding 48px
- Spinning loader icon (44×44 in `accent-soft` bg)
- Phase label (16px, 600): "Subiendo archivos" → "Analizando markdown" → "Construyendo modelo" → "Renderizando diagrama" → "Listo"
- Progress bar (320px wide, 3px tall, `bg-bg-muted` track, `bg-accent` fill, 350ms ease)
- Mono `{N}%` below

After 100% → navigate to `/diagrams/:id`.

### 6. DiagramView (the canvas — most important)

**Layout**: full-bleed `position: absolute; inset: 0; bg-bg-canvas`.

**Top bar** (48px, `bg-surface`, `border-b`, padding 0 12px, flex items-center gap-3):
- `← Volver` button (28px tall, ghost border): goes back to `/projects/:id`
- Breadcrumb (mono 12px): `{project.name} / {diagram.name}` (with `/` separators in `fg-faint`)
- Right side, mono 10.5px uppercase: `{N} bloques · {M} conexiones`

**Below the top bar** (`top-12 inset-x-0 bottom-0`): the Vue Flow canvas.

#### Canvas chrome

**Floating toolbar** (top-center, 12px from top of the canvas area, 4px padding, `bg-surface`, `r-md`, `shadow-md`, `border`):
- 6 filter chips, one per kind (backend/frontend/screen/database/flow/rules). Each: 7×7 colored dot + lowercase label + count. Click toggles visibility of nodes of that kind. Active = `bg-surface` with `border` + `shadow-xs`. Inactive = transparent + dot at 35% opacity.
- 1px divider
- Icon buttons: fit view (`maximize`), toggle minimap (`layout`)
- When focus mode is active: divider + "Salir de foco" button with `Esc` kbd

**Floating legend** (bottom-left): collapsed pill with `Leyenda` label; click expands to show kind swatches + edge style legend (solid = direct, dashed = indirect).

**Built-in Vue Flow MiniMap** (top-right of canvas, 160×100, 60px top margin to clear toolbar, 12px right margin), `pannable zoomable`. Node colors driven by their kind.

**Built-in Vue Flow Controls** (bottom-right), no interactive button.

**Background**: dotted (gap 24, size 1, color `border`).

#### Auto-layout (CRITICAL — see `prototype/diagrams.jsx` `autoLayout` function)

Layered, top-down, columns by kind:
- Column X positions: `database: 80, backend: 520, flow: 520, frontend: 1000, screen: 1440, rules: 80`
- Row gap: 230px (DB), 220px (backend, frontend) — generous because nodes are tall
- Within each column, nodes stack top-to-bottom
- Rules sit below the database column
- Flows sit below the backend column
- Screens align next to their parent frontend module (small extra gap between module groups)

#### Edges

Six relationship types — colors and styles defined in `autoLayout` `edgeBase`:

| Type | Source → Target | Color | Width | Dash | Opacity |
|---|---|---|---|---|---|
| `consumes` | frontend module → backend module (consumesApi) | `kind-frontend` | 1.4 | solid | 0.7 |
| `uses-db` | backend module → database table | `kind-database` | 1.2 | `3 3` | 0.6 |
| `contains-screen` | frontend module → screen | `kind-screen` | 1.1 | solid | 0.5 |
| `navigates` | screen → screen | `kind-screen` | 1 | `2 4` | 0.4 |
| `backend-dep` | backend module → backend module (dependsOn) | `kind-backend` | 1.2 | `4 3` | 0.55 |
| `frontend-dep` | frontend module → frontend module (dependsOn) | `kind-frontend` | 1.1 | `4 3` | 0.45 |

All edges are `type: smoothstep`, no markers.

#### Nodes (custom)

Six node types. All share a common shell: `bg-surface`, `border` (becomes kind color when selected, +3px ring at 25% alpha), `r-md`, `shadow-sm` (md when selected), 100ms transition. Header is shared; body varies.

**Common header** (46px tall):
- 22×22 rounded square in kind color/bg with kind icon
- Mono uppercase 9.5px label in kind color (`backend`/`frontend`/`screen`/`db`/`flow`/`rules`)
- Title (12.5px, 600, ellipsis)
- Optional count badge (mono 11px on `bg-muted` chip)
- 1px `border-subtle` divider below

**BackendNode** (240–250px wide):
- Header with endpoint count
- Up to 5 endpoint rows, each: method tag (mono 9px, fixed 38px width, color by method) + path (mono 10.5px, `fg-muted`, ellipsis)
  - Method colors: GET=`kind-frontend` (green), POST=`kind-backend` (blue), PUT/PATCH=`kind-flow` (amber), DELETE=`#dc2626`
- If more than 5: `+N más` row (`bg-bg-subtle`, mono 10px `fg-faint`)

**FrontendNode** (230px):
- Header with screen count
- Up to 5 screen rows: 4×4 orange dot + screen name (11px, 500) + route (mono 10px, `fg-faint`, right-aligned)
- `+N más` row if needed

**ScreenNode** (220px):
- Header (no count)
- Row: `→ {route}` (mono 10.5px, arrow in `kind-screen`)
- Row: lock or external icon + `auth` / `pública` (mono 9.5px uppercase tracking-wide)

**DatabaseNode** (230px):
- Header with column count
- One row per column (no truncation): 14px-wide tag (`PK`/`FK`/`UQ`/empty, color-coded — PK=accent, FK=green, blank=faint) + column name (`fg`, bold if PK) + type (mono, `fg-faint`, right)

**FlowNode** (240px):
- Header with step count
- Trigger row: small mono `TRIGGER` label + trigger text (sans, 10.5px, `fg-muted`)

**RulesNode** (220px):
- Header with total rule count
- Up to 3 rows summarising: `auth · {N} reglas`, `nav · {N} reglas`, `conv · {N} reglas`

**Handles**: every node exposes 4 handles (top, bottom, left source/target with ids `l`/`r`). Style: `opacity: 0`, 6×6 — invisible.

#### Click behavior

- Click on a node → select it. Side panel slides in from the right. Focus mode activates: every non-related node and edge dims to opacity 0.18 (200ms transition); the selected node + all directly connected nodes/edges stay at full opacity.
- Click on the canvas pane → deselect. Side panel closes. Focus clears.
- `Esc` → deselect.
- Filter chips → toggle visibility of all nodes of that kind (and edges to/from them).

#### Side Panel (`width: 380px`, max 92vw, slides in from right)

`bg-surface`, `border-l`, soft left shadow, fills full canvas height.

**Header** (`p-4`, `border-b`):
- Row: 28×28 kind icon in colored bg + mono uppercase kind label + close `✕`
- Title (h2, 15px, 600)
- Description paragraph (`fg-muted`, 12.5px)
- Tab strip below (3 tabs, 12.5px): **Resumen** · **Conexiones** (with count badge) · **Detalle**. Active tab gets 2px `accent` underline, weight 600.

**Body** (`overflow-y-auto p-4`):

- **Resumen** tab:
  - 2-col stat grid (each cell `bg-bg-subtle`, `border-subtle`, `r-sm`, 8px/10px padding): mono uppercase label + big value. Stats vary by kind (see below).
  - "Conexiones principales" section: up to 3 outgoing + 3 incoming as `ConnectionRow`s
- **Conexiones** tab:
  - Two sections: "Saliente" + "Entrante", each with a count
  - List of `ConnectionRow`: 20×20 kind icon · target name (12.5px, 500) + relation type as mono caption (`fg-subtle`, e.g. `→ usa tabla`, `← consume API`) · arrow icon
  - Click → select that node (re-runs the whole panel for the new selection)
- **Detalle** tab:
  - Backend → list all endpoints as mono code rows (full path)
  - Frontend → list all screens with route mono on the right
  - Screen → route in code row, badge for auth requirement
  - Database → table with columns/types/PK-FK-UQ; relations list below
  - Flow → trigger paragraph + numbered steps (each step has a colored circular index)
  - Rules → grouped lists by category

**Stats per kind**:
| Kind | Stat 1 | Stat 2 |
|---|---|---|
| backend | endpoints | tablas usadas |
| frontend | pantallas | APIs consumidas |
| screen | ruta (mono) | auth (sí/no) |
| database | columnas | relaciones |
| flow | pasos | módulos |
| rules | auth | navegación |

#### Connections logic (used by side panel)

For a selected node, compute outgoing + incoming connections. **See `prototype/diagrams.jsx` `computeConnections` function — it's small and authoritative.** Logic per kind:

- **Backend node** — outgoing: tables in `database[]`, modules in `dependsOn[]`. Incoming: frontend modules whose `consumesApi` includes me; backend modules whose `dependsOn` includes me.
- **Frontend node** — outgoing: screens in `screens[]`, backends in `consumesApi[]`, frontends in `dependsOn[]`. Incoming: frontends whose `dependsOn` includes me.
- **Screen node** — outgoing: screens in `navigatesTo[]`. Incoming: parent module + screens whose `navigatesTo` includes me.
- **Database node** — outgoing: tables in `relations[]`. Incoming: backend modules whose `database[]` includes me.
- **Flow node** — outgoing only: modules / screens / database tables it touches.

### 7. Settings

**Layout**: `max-w-[760px] mx-auto`.

Page header (`configuración` eyebrow, `Ajustes` title, description).

Sections (each: section header + bordered card):
- **Perfil**: avatar (initials), name field, email field (read-only), save button
- **Contraseña**: current, new, confirm, save button
- **Apariencia**: segmented control `Claro · Oscuro · Sistema` (3 buttons in a 1px-bordered pill, active = `bg-surface` + `shadow-xs`); layout density toggle if useful
- **Sesión**: danger card with "Cerrar sesión" + "Eliminar cuenta" buttons (danger variant)

---

## Components Inventory (suggested Vue tree)

```
src/components/
  layout/
    AppTopbar.vue           # global header w/ logo, breadcrumb, search, theme, avatar
    PageHeader.vue          # eyebrow + h1 + description + right slot for actions
  ui/
    Button.vue              # variants: primary, secondary, ghost, danger; sizes: sm, md
    Input.vue
    Field.vue               # label + control + helper/error
    Card.vue
    Badge.vue               # color: success/warning/danger/info/neutral + kind colors
    Stat.vue                # mono label + big value; mono prop for code values
    SectionHeader.vue       # mono uppercase label + optional count
    Segmented.vue           # active/inactive pills (used in settings + side panel tabs)
    Modal.vue
    Toast.vue
    CommandPalette.vue      # Cmd+K dialog with fuzzy list
    Logo.vue                # monogram + optional wordmark
    Icon.vue                # thin wrapper around lucide-vue-next
  diagram/
    DiagramCanvas.vue       # the Vue Flow wrapper
    DiagramTopbar.vue       # back button + breadcrumb + counts
    CanvasToolbar.vue       # filter chips + view buttons + focus exit
    CanvasLegend.vue        # collapsible legend
    SidePanel.vue           # slide-in inspector w/ tabs
    nodes/
      BackendNode.vue
      FrontendNode.vue
      ScreenNode.vue
      DatabaseNode.vue
      FlowNode.vue
      RulesNode.vue
      NodeShell.vue         # shared frame + header
    panel/
      OverviewTab.vue
      ConnectionsTab.vue
      DetailsTab.vue
      ConnectionRow.vue
  views/
    AuthLogin.vue
    AuthRegister.vue
    Dashboard.vue
    ProjectNew.vue
    ProjectDetail.vue
    DiagramNew.vue
    DiagramView.vue
    Settings.vue
```

---

## State (Pinia stores)

- `useAuthStore`: `user`, `login()`, `register()`, `logout()`. Persist token in `localStorage`.
- `useProjectsStore`: `projects[]`, `fetchAll()`, `getById(id)`, `create()`, `delete()`.
- `useDiagramsStore`: `byProject[id]`, `current`, `fetch(id)`, `generate(files, name, projectId)`.
- `useUiStore`: theme (`light`/`dark`/`system`), commandPaletteOpen, currently visible kinds on canvas.

---

## Data Model (see `prototype/data.js` for the exact shape)

```ts
type User = { id, name, email, initials, joinedAt };
type Project = {
  id, name, description, diagramCount, createdAt, updatedAt, pinned?: boolean
};
type Diagram = {
  id, projectId, name, description, createdAt,
  data: DiagramModel
};
type DiagramModel = {
  modules: {
    backend: BackendModule[];
    frontend: FrontendModule[];
  };
  screens: Screen[];
  flows: Flow[];
  database: Table[];
  systemRules: { auth: string[]; navigation: string[]; conventions: string[] };
};
type BackendModule = {
  id, name, description, layer: "backend",
  api: string[],          // "POST /auth/login"
  database: string[],     // table ids
  dependsOn: string[],    // backend module ids
};
type FrontendModule = {
  id, name, description, layer: "frontend",
  screens: string[],      // screen ids
  consumesApi: string[],  // backend module ids
  dependsOn: string[],    // frontend module ids
};
type Screen = {
  id, name, route, module,        // module = parent frontend id
  requiresAuth: boolean,
  navigatesTo: string[],          // screen ids
};
type Flow = {
  id, name, trigger,
  screens: string[],
  modules: string[],              // any module id (backend or frontend)
  database: string[],
  steps: string[],
};
type Table = {
  id, name,
  usedBy: string[],               // module ids
  relations: { target, type, field }[],
  fields: { name, type, pk?, fk?, unique? }[],
};
```

---

## Interactions & Behavior

### Theme
Read user preference + system. Toggle adds/removes `data-theme="dark"` on `<html>`. Tokens are scoped under `:root` and `[data-theme="dark"]`, so all components react automatically.

### Cmd+K command palette
Listens for `cmd/ctrl+k` globally. Modal centered, top-third of screen, `surface-overlay`. Items: "Ir al dashboard", "Nuevo proyecto", "Ajustes", "Cerrar sesión", and recent diagrams. Fuzzy match with kbd-rendered shortcuts.

### File upload (DiagramNew)
Drag-and-drop accepts `.md` / `.markdown`. Visual: dashed border becomes solid accent + bg `accent-soft` on dragover. Filter input on drop to keep only matching extensions.

### Diagram generation (mocked timing)
On submit: 5 phases, ~420ms each, advancing the progress bar to 14 / 38 / 64 / 88 / 100. After 100, navigate to the diagram view.

### Focus mode (canvas)
On node click: dim non-related (opacity 0.18, 180ms transition). The "rf-active" nodes + connected edges stay at 1.0. Toolbar shows `Salir de foco` chip with kbd `Esc`. Click pane or press Esc clears.

### Filter chips (canvas)
Toggling a kind sets `hidden: true` on those nodes and on any edge whose source or target is hidden. Vue Flow handles the rest.

### Side panel cross-navigation
Clicking a connection row inside the panel selects that node, which re-renders the panel with the new node's data — keep the panel open, do not animate close + reopen, just swap content.

---

## Animations & Transitions

| What | Duration | Easing |
|---|---|---|
| Side panel slide-in | 200ms | `cubic-bezier(0.2, 0.8, 0.2, 1)` |
| Focus dim/un-dim | 180ms | `ease` |
| Progress bar fill | 350ms | `cubic-bezier(0.4, 0, 0.2, 1)` |
| Hover/border transitions | 100ms | `linear` |
| Loader spin | 0.9s | linear infinite |

---

## Responsive

The prototype targets desktop. Minimum supported width: **1024px** for the canvas. Mobile is out of scope for v1; show a simple "open on desktop" message under 768px.

---

## Files in `prototype/`

| File | What it shows |
|---|---|
| `CodeAtlas.html` | Entry point; loads React + React Flow + Babel + the JSX files |
| `tokens.css` | All design tokens (light + dark) — match these in `tailwind.config.js` |
| `app.jsx` | Top-level routing + state; mirror as Vue Router + Pinia |
| `auth.jsx` | Login + Register screens |
| `screens.jsx` | Dashboard + ProjectNew + ProjectDetail + Settings |
| `diagrams.jsx` | DiagramNew (upload) + DiagramView (canvas) + autoLayout + SidePanel + tabs + connection logic |
| `nodes.jsx` | The 6 custom node types — port directly to Vue Flow custom nodes |
| `ui.jsx` | UI primitives: Button, Input, Field, Card, Badge, etc. |
| `data.js` | Hardcoded fixtures — use as seed data and as the canonical schema |

**Most important files to study**: `nodes.jsx` (node anatomy), `diagrams.jsx` (autoLayout, computeConnections, side panel), `tokens.css` (colors and shadows). Everything else is straightforward.

---

## Acceptance criteria

- All 8 routes render and navigate correctly.
- Theme toggle persists across reloads.
- Diagram canvas renders all 6 node kinds with their detail rows (endpoints / columns / screens etc.) populated from the data model.
- Edges follow the 6-type styling table above.
- Click a node → side panel opens; focus mode dims unrelated nodes; Esc closes.
- Click a connection row inside the panel → selection moves to that node, panel updates in place.
- Filter chips toggle visibility per kind.
- Auto-layout produces no overlapping nodes for the bundled fixture.
- Dashboard, project detail, settings render in light + dark with correct token usage.

---

## Out of scope for v1 (do not implement)

- Real authentication / backend / API
- Markdown parser (the upload flow is decorative — backend will handle parsing)
- Diagram editing (read-only canvas)
- Sharing / collaboration
- Mobile / tablet layout
