# Rediseño: Representación de flujos en el diagrama

**Fecha:** 2026-05-08  
**Estado:** Pendiente de implementación

---

## Motivación

Los flujos son interacciones transversales que involucran múltiples capas (base de datos, backend, frontend, screens). Representarlos como nodos independientes en el canvas no refleja su naturaleza real y genera ruido visual. El rediseño los elimina como nodos y los integra contextualmente en los bloques existentes, con un modo dedicado para explorar su recorrido completo.

---

## 1. Nuevo formato Markdown de los archivos de flujo

El cambio principal: los pasos dejan de ser texto libre y pasan a tener una referencia opcional al nodo al que pertenecen.

### Formato actual

```markdown
## Steps
- El usuario envía el formulario de login
- Se valida el token en el backend
- Se consulta el usuario en base de datos
```

### Nuevo formato

```markdown
## Steps
- [screen:login] El usuario rellena el formulario de login
- [frontend:auth-frontend/LoginView.vue] Se envían las credenciales al endpoint
- [backend:auth-backend/auth.service.ts/validateToken] Se valida el token JWT
- [database:users] Se consulta el usuario en la base de datos
- [backend:auth-backend/session.service.ts/createSession] Se crea la sesión
- [screen:dashboard] Se redirige al dashboard
```

### Sintaxis de referencia: `[capa:moduleId/archivo/función]`

| Capa | Ejemplo | Granularidad |
|---|---|---|
| `screen` | `[screen:login]` | pantalla |
| `frontend` | `[frontend:auth-frontend/LoginView.vue]` | módulo / componente |
| `backend` | `[backend:auth-backend/auth.service.ts/validateToken]` | módulo / archivo / función |
| `database` | `[database:users]` | tabla(s) separadas por coma |
| *(sin ref)* | *(ausente)* | paso sin nodo asignado — válido, aparece en el panel pero no genera edge |

Los niveles de granularidad son opcionales de derecha a izquierda:
- `[backend:auth-backend]` → solo módulo
- `[backend:auth-backend/auth.service.ts]` → módulo + archivo
- `[backend:auth-backend/auth.service.ts/validateToken]` → módulo + archivo + función

---

## 2. Nuevo modelo JSON — objeto Step

`flow.steps` pasa de `string[]` a `StepObject[]`.

```js
// Objeto flow completo
{
  id: 'user-login',
  name: 'Login de usuario',
  trigger: 'el usuario envía el formulario de login',
  description: '...',
  steps: [
    {
      index: 0,
      label: 'El usuario rellena el formulario de login',
      layer: 'screen',           // 'screen' | 'frontend' | 'backend' | 'database' | null
      moduleId: 'login',         // ID del módulo / screen / tabla referenciado
      file: null,                // solo backend y frontend
      fn: null,                  // solo backend
      nodeId: 'scr-login',       // ID de VueFlow — calculado por el parser al construir el modelo
    },
    {
      index: 1,
      label: 'Se envían las credenciales al endpoint',
      layer: 'frontend',
      moduleId: 'auth-frontend',
      file: 'LoginView.vue',
      fn: null,
      nodeId: 'mod-auth-frontend',
    },
    {
      index: 2,
      label: 'Se valida el token JWT',
      layer: 'backend',
      moduleId: 'auth-backend',
      file: 'auth.service.ts',
      fn: 'validateToken',
      nodeId: 'mod-auth-backend',
    },
    {
      index: 3,
      label: 'Se consulta el usuario en BD',
      layer: 'database',
      moduleId: 'users',
      file: null,
      fn: null,
      nodeId: 'db-users',
    },
    {
      index: 4,
      label: 'Se crea la sesión',
      layer: 'backend',
      moduleId: 'auth-backend',
      file: 'session.service.ts',
      fn: 'createSession',
      nodeId: 'mod-auth-backend',   // mismo nodo que el paso 2 — se agrupan en el panel
    },
    {
      index: 5,
      label: 'Se redirige al dashboard',
      layer: 'screen',
      moduleId: 'dashboard',
      file: null,
      fn: null,
      nodeId: 'scr-dashboard',
    },
  ],
  errorCases: [...],
  notes: '...',
}
```

**Nota sobre `nodeId`:** el parser lo calcula usando las mismas reglas que `auto-layout.js`:
- Screen → `scr-{id}`
- Backend o frontend → `mod-{id}`
- Database → `db-{id}`

Así el frontend no necesita resolver la referencia — ya llega lista.

---

## 3. Cambios en los nodos del canvas

Los nodos `flow-X` desaparecen del canvas. En su lugar, cada nodo de tipo `backend`, `frontend`, `screen` y `database` muestra una sección de flujos en la parte inferior del card, listando los flujos que tienen al menos un paso apuntando a ese nodo.

### Aspecto del card con flujos

```
┌─────────────────────────────────┐
│  mod  auth-backend              │
│  Auth Module                    │
│  ──────────────────────────────│
│  endpoints: 4  deps: 2          │
│  ──────────────────────────────│
│  ◈ Login de usuario   2 pasos  │  ← chip de flujo
│  ◈ Reset password     1 paso   │
└─────────────────────────────────┘
```

- Cada chip muestra el nombre del flujo y cuántos pasos de ese flujo tocan este nodo.
- Click en el chip → activa el modo Flujos con ese flujo seleccionado y abre el panel izquierdo con sus pasos.

---

## 4. Modos del canvas

Se añade un toggle en `CanvasToolbar`:

```
[ Relaciones ]  [ Flujos ]
```

### Modo Relaciones (comportamiento actual, sin cambios)

- Edges coloreados por tipo (backend-dep, consumes, uses-db, etc.)
- Chips de filtro por tipo de nodo
- `CanvasRules` pill en esquina superior izquierda
- Sin `CanvasFlowSelector`

### Modo Flujos

- Edges normales ocultos
- `CanvasRules` reemplazado por `CanvasFlowPanel` (panel de pasos del flujo activo)
- `CanvasFlowSelector` visible en esquina superior derecha
- Edges amarillos del flujo seleccionado
- Chips de filtro desactivados — todos los nodos visibles para poder seguir el recorrido completo
- Click en nodo participante → sus pasos en el flujo activo se resaltan en el panel izquierdo

---

## 5. CanvasFlowSelector — panel derecha

Mismo patrón visual que `CanvasRules` (pill colapsado / panel expandido), posicionado en `top: 12px, right: 12px`.

### Pill colapsado

```
[ ◈  3 flujos  ∨ ]
```

### Panel expandido (230px de ancho)

```
┌──────────────────────────────┐
│  ◈ Flujos del sistema    3 ∧ │
├──────────────────────────────│
│  ● Login de usuario          │  ← flujo activo (fondo tintado)
│    trigger: envía formulario  │
│    6 pasos                   │
├──────────────────────────────│
│  ○ Reset password            │
│    trigger: solicita reset    │
│    4 pasos                   │
├──────────────────────────────│
│  ○ Registro de usuario       │
│    trigger: llena formulario  │
│    8 pasos                   │
└──────────────────────────────┘
```

- Solo un flujo activo a la vez.
- Color de icono y selección: `var(--kind-flow)`.

---

## 6. CanvasFlowPanel — panel izquierda (modo Flujos)

Reemplaza a `CanvasRules` cuando el modo Flujos está activo. Ancho 260px, posición `top: 12px, left: 12px`.

### Estructura visual

```
┌─────────────────────────────────────┐
│  ◈ Login de usuario              ∧  │
│  trigger: el usuario envía el...    │
├─────────────────────────────────────│
│  1  [screen]   login                │
│     El usuario rellena el formulario│
├─────────────────────────────────────│
│  2  [frontend]  auth-frontend       │  ← nodo seleccionado en canvas:
│     LoginView.vue                   │     borde izquierdo accent
│     Se envían las credenciales      │
├─────────────────────────────────────│
│  3  [backend]  auth-backend         │
│  4  auth.service.ts › validateToken │  ← pasos 3 y 4: mismo nodo, consecutivos
│     session.service.ts › create     │     → agrupados bajo la misma cabecera
│     Se valida el token / Se crea... │
├─────────────────────────────────────│
│  5  [database]  users               │
│     Se consulta el usuario          │
├─────────────────────────────────────│
│  6  [screen]   dashboard            │
│     Se redirige al dashboard        │
└─────────────────────────────────────┘
```

### Reglas de agrupación y highlight

- Pasos **consecutivos en el mismo nodo** → misma cabecera de nodo, agrupados visualmente sin borde entre ellos.
- Pasos **no consecutivos en el mismo nodo** → la cabecera de nodo se repite con su número de paso correspondiente.
- Nodo seleccionado en canvas → **todos** sus pasos en este flujo reciben `border-left: 2px solid var(--kind-flow)`.

---

## 7. Edges amarillos — reglas de generación

Para cada par de pasos consecutivos `(i, i+1)` en el flujo activo:

```
step[i].nodeId === step[i+1].nodeId  →  sin edge (mismo nodo, se ve en el panel)
step[i].nodeId !== step[i+1].nodeId  →  edge amarillo dirigido de i a i+1
```

Si el mismo par `(sourceNodeId → targetNodeId)` aparece N veces a lo largo del flujo, se dibuja **un solo edge** con un badge `×N`.

### Estilo del edge

```js
{
  type: 'smoothstep',
  animated: true,
  style: {
    stroke: 'var(--kind-flow)',
    strokeWidth: 1.8,
    strokeDasharray: '5 3',
  },
  label: count > 1 ? `×${count}` : undefined,
}
```

---

## 8. Resumen de cambios por capa

| Capa | Qué cambia |
|---|---|
| **Markdown (docs)** | Steps añaden prefijo `[layer:ref]` opcional |
| **Parser backend** | Parsea el prefijo de cada step → genera `StepObject` con `nodeId` calculado |
| **Model JSON** | `flow.steps` pasa de `string[]` a `StepObject[]` |
| **auto-layout.js** | Ya no genera nodos `flow-X` |
| **node-meta.js** | `flow` se puede eliminar de `KIND_KEYS` de filtros |
| **Nodos del canvas** | `BackendNode`, `FrontendNode`, `ScreenNode`, `DatabaseNode` añaden sección de chips de flujos |
| **DiagramView** | Añade estado `mode` (`'relations'`/`'flows'`) y `activeFlowId`; lógica de edges amarillos |
| **CanvasToolbar** | Añade toggle Relaciones / Flujos; oculta filtros de tipo en modo Flujos |
| **CanvasRules** | Se oculta cuando el modo Flujos está activo |
| **CanvasFlowPanel** *(nuevo)* | Panel izquierdo con pasos secuenciales del flujo activo |
| **CanvasFlowSelector** *(nuevo)* | Panel derecho con lista de flujos seleccionables |
| **SidePanel** | En modo Flujos muestra el detalle del flujo cuando se clicka un chip en un nodo |
| **FlowNode** | Eliminado — ya no se usa |

---

## 9. Compatibilidad con datos existentes

Los archivos de flujo existentes sin prefijos en los steps siguen siendo válidos. El parser trata los steps sin prefijo como `{ layer: null, moduleId: null, file: null, fn: null, nodeId: null }`. En el canvas no generan edges ni aparecen en chips de nodos, pero sí aparecen en el panel de pasos como entradas de texto simple. La migración es incremental — se pueden enriquecer los steps de uno en uno.
