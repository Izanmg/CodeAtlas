# Persistencia de coordenadas del diagrama

## El problema

Sin coordenadas guardadas, cada vez que el usuario abre un diagrama los nodos aparecen en posiciones calculadas automáticamente. El usuario los arrastra para organizarlo, cierra la pestaña, y al volver los encuentra desordenados otra vez.

## La solución

Guardar las coordenadas `x` e `y` de cada nodo junto con el diagrama. Cuando el usuario mueve un nodo, se persiste su nueva posición. Cuando abre el diagrama, los nodos aparecen exactamente donde los dejó.

## Dónde vive este dato

Las coordenadas **no forman parte del modelo JSON que genera el parser**. El parser produce información de arquitectura (módulos, pantallas, flujos...) — las coordenadas son datos de presentación, no de arquitectura.

Se guardan en una capa separada ligada al diagrama: un objeto `layout` que mapea cada ID de nodo a su posición:

```json
{
  "layout": {
    "auth-backend":   { "x": 120, "y": 80  },
    "auth-frontend":  { "x": 420, "y": 80  },
    "users":          { "x": 120, "y": 320 },
    "login":          { "x": 420, "y": 280 },
    "user-login":     { "x": 270, "y": 480 }
  }
}
```

El frontend fusiona el modelo del parser con el layout para renderizar cada nodo en su posición guardada. Si un nodo existe en el modelo pero no tiene coordenadas en el layout (por ejemplo, porque se acaba de añadir), se le asigna una posición automática.

## Dónde se implementa

En el módulo **`diagrams`**, que es el módulo lógico para todo lo relacionado con la visualización. Tiene sentido que la gestión del layout viva aquí y no en el parser, porque es un dato de presentación.

### Backend — nuevo endpoint en el módulo `diagrams`

```
PATCH /api/diagrams/:id/layout
Body: { "layout": { "auth-backend": { "x": 120, "y": 80 }, ... } }
```

Se llama cada vez que el usuario mueve un nodo (con debounce para no saturar). Actualiza solo el campo `layout` del diagrama sin tocar el modelo de arquitectura.

```
GET /api/diagrams/:id
Response: { model: {...}, layout: {...} }
```

El GET del diagrama devuelve tanto el modelo (generado por el parser) como el layout (guardado por el usuario).

### Frontend — módulo `diagrams`

Cuando Vue Flow emite el evento de nodo movido, el store de diagramas actualiza el layout en local y lanza la llamada `PATCH` al backend con debounce.

## Estructura del módulo `diagrams` (backend)

Sigue el esquema estándar de módulos:

```
modules/diagrams/
├── diagrams.routes.js
├── diagrams.controller.js
├── diagrams.service.js
└── diagrams.repository.js
```

## Por qué es buen momento para definir esto

Los módulos de backend todavía no están creados. Definir ahora que el módulo `diagrams` existe y es responsable del layout evita tener que refactorizar después. Cuando se implemente, el módulo `diagrams` gestionará:

- Recuperar un diagrama (modelo + layout)
- Actualizar el layout tras mover nodos
- En el futuro: crear y eliminar diagramas, asociarlos a proyectos

## Coordenadas por defecto — layout-calculator.js

Cuando el parser genera un modelo por primera vez, los nodos no tienen posición. En lugar de dejar eso al frontend, el propio parser calcula un layout inicial razonable. Esto se hace en un archivo nuevo dentro de `core/`:

```
modules/parser/core/layout-calculator.js
```

### Estrategia de columnas

Los nodos se distribuyen en cuatro columnas verticales, de izquierda a derecha según el flujo de datos natural del sistema:

```
database | backend | frontend | screens
```

Las entidades de base de datos van a la izquierda porque son la base. Los módulos backend las consumen. Los módulos frontend consumen los backends. Las pantallas pertenecen a los frontends.

Los **flujos** van en una fila horizontal al fondo, debajo de todas las columnas, porque tocan múltiples elementos.

Las **reglas del sistema** van arriba a la izquierda en posición fija, fuera de las columnas normales. Son un nodo global, no pertenecen a ninguna capa.

### Constantes

```js
const NODE_WIDTH  = 280
const NODE_HEIGHT = 160
const V_GAP       = 60   // espacio vertical entre nodos de la misma columna
const COL_GAP     = 120  // espacio horizontal entre columnas
const START_X     = 60
const COLS_START_Y = 280  // Y donde empiezan las columnas (deja espacio para system-rules)
```

### Posiciones de columna (X)

| Columna   | X calculada                          |
|-----------|--------------------------------------|
| database  | 60                                   |
| backend   | 60 + 280 + 120 = 460                 |
| frontend  | 460 + 280 + 120 = 860                |
| screens   | 860 + 280 + 120 = 1260               |

### Posición de las filas (Y)

Dentro de cada columna, los nodos se apilan verticalmente:

```
y = COLS_START_Y + index * (NODE_HEIGHT + V_GAP)
```

El primer nodo de cada columna empieza en `y = 280`. El siguiente a `280 + 160 + 60 = 500`. Y así sucesivamente.

### Posición de los flujos (Y)

Los flujos se sitúan debajo de la columna más larga:

```
maxBottom = max(columnas) donde bottom = COLS_START_Y + count * (NODE_HEIGHT + V_GAP)
flowsY = maxBottom + V_GAP
```

Los flujos se distribuyen en la fila horizontal con el mismo `COL_GAP` entre ellos, centrados horizontalmente respecto al ancho total de las columnas.

### Posición de system-rules

Fija: `{ x: 60, y: 60 }`. No entra en ninguna columna.

### Integración en el pipeline

Se añade como paso 6 entre `resolveReferences` y `saveModel`. El modelo no cambia — el layout es un objeto separado que se guarda junto a él:

**Pipeline actualizado:**
```
1. sortFiles
2. extractFromMarkdown
3. validateAndParse
4. buildModel
5. resolveReferences
6. calculateLayout   ← nuevo
7. saveModel         ← ahora recibe { model, layout }
```

**Cambios en `parser.service.js`:**
- Importa `calculateLayout` de `./core/layout-calculator.js`
- Llama `calculateLayout(resolved)` para obtener el layout inicial
- Pasa `{ model: resolved, layout }` a `saveModel`
- Devuelve `{ model: resolved, layout }` al controller

**Cambios en `parser.repository.js`:**
- `storedModel` pasa a ser `storedDiagram` y guarda `{ model, layout }`
- `saveModel(diagram)` guarda el objeto completo
- `getModel()` devuelve `{ model, layout }` (o null si vacío)

## Estado

- [x] Documentado
- [ ] `core/layout-calculator.js` — por implementar
- [ ] `parser.service.js` — actualizar pipeline
- [ ] `parser.repository.js` — guardar `{ model, layout }`
