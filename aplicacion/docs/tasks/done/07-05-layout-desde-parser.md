# 07-05 — Posicionamiento de nodos desde el parser

## Qué se hizo

Cambiamos la forma en que los nodos del diagrama obtienen sus coordenadas en el canvas. Antes, `auto-layout.js` calculaba las posiciones en el frontend usando un sistema de columnas fijo. Ahora las coordenadas las calcula el backend (el parser) y el frontend las recoge directamente.

## Cambios aplicados

**Backend** — el pipeline del parser ya incluía `calculateLayout` como paso 6. Devuelve `{ model, layout }` donde `layout` es un mapa `{ [nodeId]: { x, y } }` con las coordenadas de cada nodo.

**`auto-layout.js`** — acepta ahora `{ model, layout }` en lugar de solo `model`. Para cada nodo busca primero en `layout[rawId]`; si no existe, cae al cálculo por columnas como fallback. Los edges se siguen construyendo siempre desde el modelo (lógica permanente).

**`seed-diagrams.js`** — regenerado pasando toda la `app-doc/` por el endpoint `POST /api/parser/doc`. El campo `data` del diagrama semilla pasa de ser el modelo plano a `{ model, layout }` con las coordenadas reales que devolvió el parser.

**`DiagramView.vue`** — dos ajustes menores: `diagram.value.data.model.screens` (antes `data.screens`) y `:model="diagram?.data?.model"` en el SidePanel.

**`diagrams-mock.js`** — clave de localStorage bumpeada a `v2` para descartar caché en formato antiguo.
