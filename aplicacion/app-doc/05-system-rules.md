---
type: system-rules
---

## Auth

- Todas las rutas excepto `/login` y `/register` requieren autenticación (`meta.requiresAuth: true`)
- El guard global del router redirige a `/login` si el usuario no está autenticado e intenta acceder a una ruta protegida
- Las rutas `/login` y `/register` son `guestOnly`: si el usuario ya tiene sesión, el guard redirige al dashboard
- La sesión se gestiona en `auth.store.js` con Pinia; la persistencia real es responsabilidad de `logica-temporal/auth-mock.js`

## Navigation

- Las rutas no encontradas (`/:pathMatch(.*)*`) redirigen al dashboard `/`
- El botón Volver en `DiagramView` navega al proyecto al que pertenece el diagrama, no a la historia del navegador
- Cuando se genera un diagrama nuevo, el frontend redirige automáticamente al canvas del diagrama resultante

## Diagrama (canvas)

- El modo foco se activa al hacer clic en un nodo y se limpia al hacer clic en el lienzo vacío o pulsando Esc
- Los filtros de tipo de nodo ocultan también los edges cuyos nodos origen o destino están ocultos
- El side panel vuelve siempre a la pestaña Resumen cuando cambia el nodo seleccionado
- Vue Flow recibe siempre arrays computados (`filteredNodes`, `filteredEdges`); los nodos y edges originales no se mutan directamente

## Datos temporales (logica-temporal)

- Los archivos en `logica-temporal/` son la única parte que cambia cuando se conecta el backend real
- Los stores de Pinia delegan a `logica-temporal/` y no contienen lógica de red ni de persistencia
- Los archivos en `core/` (node-meta, compute-connections, auto-layout) son lógica de dominio permanente que no depende del backend

## Convenciones de código

- Frontend en Vue 3 con `<script setup>` y Composition API; sin Options API
- Estilos con Tailwind CSS v3 + tokens como variables CSS (`--fg`, `--surface`, `--border`, etc.) definidas en `styles/tokens.css`
- Stores Pinia con la API de `setup()` (no `defineStore` con objeto de opciones)
- IDs de rutas en kebab-case; nombres de componentes en PascalCase; nombres de archivos de componentes en PascalCase, de utilidades en kebab-case
- Los estilos de los componentes usan clases Tailwind y propiedades `:style` inline con tokens CSS para valores dinámicos

## Parser (backend)

- El pipeline de parseo ejecuta siempre en el mismo orden fijo; ningún paso puede saltarse
- Los errores de validación del frontmatter empiezan por `[nombre-archivo]` para que el controller los distinga de errores internos
- El repositorio persiste en memoria mientras no haya base de datos configurada; el service no necesita tocarse cuando cambie
- `POST /api/parser/code` está registrado pero devuelve 501 hasta la siguiente iteración
