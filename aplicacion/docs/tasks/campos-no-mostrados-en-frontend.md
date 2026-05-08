# Campos generados por el parser que no se muestran en el frontend

Auditoría completa del modelo JSON unificado vs. lo que el frontend renderiza.
Cada fila documenta un dato que el parser **sí guarda** en el modelo (porque
está descrito en `aplicacion/ia-doc/`) pero que **ningún componente del
frontend muestra**.

> Fecha de la auditoría: 2026-05-08
> Comparación contra: `aplicacion/backend/src/modules/parser/core/model-builder.js`
> y todos los `.vue` bajo `aplicacion/frontend/src/modules/diagrams/`.

---

## 1. Módulos (backend y frontend)

| Campo | Origen en el `.md` | Descripción |
|---|---|---|
| `purpose` | sección `## Purpose` (obligatoria en módulos) | Texto descriptivo profundo del módulo. Es el contenido más rico del archivo y no aparece en ningún sitio del side panel. |
| `notes` | sección `## Notes` | Decisiones técnicas, restricciones específicas del módulo. Se descartan. |
| `state` (solo frontend) | sección `## State` | Variables de estado principales que gestiona el módulo. No se renderiza. |
| `extensions` | secciones libres del usuario (`## Performance`, `## Security`, etc.) | El parser las conserva tal cual; el frontend nunca las lee. |

---

## 2. Pantallas

| Campo | Origen en el `.md` | Descripción |
|---|---|---|
| `folder` + `file` | frontmatter | Vínculo explícito de la pantalla con la carpeta y el archivo del módulo que la implementa (ver `ia-doc/formatos/pantallas.md` § "El vínculo folder + file con el módulo"). No se muestra. |
| `fullDescription` | sección `## Description` (obligatoria) | Descripción detallada larga. Solo se muestra el `description` corto del frontmatter. |
| `elements` | sección `## Elements` | Elementos UI visibles en la pantalla. No se muestran. |
| `actions` | sección `## Actions` | Acciones que el usuario puede realizar. No se muestran. |
| `states` | sección `## States` | Estados posibles (loading, error, empty…). No se muestran. |
| `extensions` | secciones libres | No se muestran. |

---

## 3. Flujos

| Campo | Origen en el `.md` | Descripción |
|---|---|---|
| `errorCases` | sección `## Error Cases` | Qué puede fallar en cada momento del flujo. Documentado como recomendado, invisible en la UI. |
| `notes` | sección `## Notes` | Decisiones técnicas del flujo. No se muestran. |
| `extensions` | secciones libres | No se muestran. |

---

## 4. Base de datos (entidades)

| Campo | Origen en el `.md` | Descripción |
|---|---|---|
| `notes` | sección `## Notes` | Reglas de negocio sobre los datos, valores permitidos, restricciones no evidentes. No se muestran. |
| `extensions` | secciones libres | No se muestran. |

---

## 5. Reglas del sistema

| Campo | Origen en el `.md` | Descripción |
|---|---|---|
| `validation` | sección `## Validation` | Reglas de validación globales. `CanvasRules.vue` solo pinta `auth`, `navigation` y `conventions`. |
| `technicalDecisions` | sección `## Technical Decisions` | Decisiones de arquitectura/tecnología transversales. No se muestran. |
| `extensions` | secciones libres (`## Performance`, `## Security`, `## Accessibility`…) | No se muestran. |

---

## 6. Índice de módulos (`01-modules.md`)

| Campo | Origen en el `.md` | Descripción |
|---|---|---|
| `## Overview` | sección obligatoria del índice | El parser descarta el archivo entero (case `'modules-index'` en `model-builder.js:dispatch` no llama a ningún builder). El Overview se pierde. |
| `file-types.backend` / `file-types.frontend` | vocabulario del proyecto | Solo se usan dentro del backend para validación (avisos). Nunca se exponen al frontend. |

---

## Resumen ejecutivo — los huecos más relevantes

1. **`purpose` de módulos** — la sección obligatoria con la descripción larga del módulo no se ve. Hueco evidente en el side panel.
2. **`notes` en cualquier elemento** (módulos, flujos, entidades) — decisiones técnicas que el usuario se molesta en escribir y que se pierden.
3. **Pantallas: `elements`, `actions`, `states`, `fullDescription`** — son las cuatro secciones recomendadas del formato de pantalla. La pantalla en la app casi no enseña nada de su contenido funcional.
4. **Flujos: `errorCases`** — solo se ven los pasos felices; los fallos no.
5. **Reglas: `validation` y `technicalDecisions`** — dos de las cinco secciones reconocidas explícitamente, totalmente invisibles.
6. **Pantallas → archivo del módulo (`folder`/`file`)** — el vínculo bidireccional pantalla↔archivo del que habla `pantallas.md` no se renderiza en ninguna parte.
7. **`extensions`** — todas las secciones libres del usuario se parsean y se almacenan, y se descartan al renderizar.

---

## Sugerencia de implementación (orden recomendado)

1. Añadir un acordeón **"Descripción"** en el `DetailsTab` que muestre `purpose` (módulos) o `fullDescription` (pantallas) cuando exista.
2. Añadir un acordeón **"Notas"** que aparezca para cualquier nodo cuyo `notes` no sea null.
3. Para pantallas, añadir tres bloques colapsables: `elements`, `actions`, `states`.
4. Para flujos, añadir bloque **"Casos de error"** con `errorCases`.
5. Ampliar `CanvasRules.vue` para mostrar también `validation` y `technicalDecisions` (mismo patrón que los otros tres grupos).
6. Renderizar `extensions` como un grupo final "Otras secciones" en el `DetailsTab` con cada clave como subtítulo.
7. Implementar el vínculo pantalla↔archivo: cuando un screen tenga `folder`+`file`, mostrar un enlace al módulo y resaltar el archivo en el árbol cuando se abra ese módulo.
8. (Opcional) Persistir el `## Overview` de `01-modules.md` en `model.overview` y mostrarlo en algún sitio del header del diagrama o como tooltip del título.
