# ia-doc — Guías para generación de documentación con IA

## Qué es esto

Definición e implementación de la carpeta `ia-doc/` dentro de `aplicacion/`.

El objetivo es que un usuario pueda abrir una conversación con cualquier IA (Claude, ChatGPT, Gemini, Copilot…), pasarle el archivo principal de esta carpeta, y la IA sepa generar los archivos `.md` que CodeAtlas necesita — sin que el usuario tenga que conocer ni escribir el formato a mano.

La IA puede trabajar en dos modos según la preferencia del usuario: **modo entrevista** (la IA hace preguntas y guía paso a paso) o **modo transformación** (el usuario describe su app y la IA convierte esa descripción directamente en archivos).

---

## Por qué se necesita

El parser de CodeAtlas espera archivos `.md` con un frontmatter YAML muy concreto y unas secciones Markdown bien definidas. Si el usuario no conoce el formato, los archivos que genere serán incorrectos y el parser fallará.

En lugar de obligar al usuario a leer la especificación técnica, `ia-doc/` expone ese conocimiento en un formato que una IA puede consumir directamente y usar para guiar una conversación.

---

## Estructura a crear

```
aplicacion/ia-doc/
├── GUIA-IA.md          ← archivo principal, auto-contenido
└── formatos/
    ├── modulos.md
    ├── pantallas.md
    ├── flujos.md
    ├── base-datos.md
    └── reglas.md
```

---

## Qué hace cada archivo

### `GUIA-IA.md`

Es el punto de entrada. El usuario se lo pasa a la IA al inicio de la conversación (adjunto, copiado como mensaje inicial, o con instrucción de leerlo si la IA tiene acceso a herramientas).

Contiene:

1. **El rol de la IA** — descripción directa de qué tiene que hacer: generar archivos `.md` con el formato exacto que espera CodeAtlas, en cualquiera de los dos modos.
2. **Los dos modos de trabajo:**
   - **Modo entrevista**: la IA detecta que el usuario no tiene la arquitectura definida y le hace preguntas ordenadas bloque a bloque hasta tener todo lo necesario para generar.
   - **Modo transformación**: el usuario describe su app (de golpe o por partes) y la IA infiere IDs, rellena campos vacíos con valores razonables, genera en el orden correcto y avisa de qué falta al terminar.
3. **La estructura de carpetas que debe producir** — la jerarquía completa de `project-docs/` con todos los archivos que pueden existir.
4. **El orden de generación** — por qué importa el orden (los módulos antes que las pantallas, porque las pantallas referencian IDs de módulos) y en qué secuencia generar cada bloque.
5. **Resumen de cada tipo de archivo** — frontmatter mínimo obligatorio y secciones clave, lo suficiente para que la IA pueda generar sin leer los archivos de `formatos/`.
6. **Instrucción de referencia a `formatos/`** — si la IA tiene acceso a herramientas y necesita el detalle completo de un tipo, que lea el archivo correspondiente de `formatos/`.

Este archivo está escrito como system prompt directo ("Cuando el usuario te diga X, haz Y") para que cualquier IA lo interprete de la misma manera.

### `formatos/modulos.md`

Especificación completa del formato de los archivos de módulo (backend y frontend) y del índice `01-modules.md`. Incluye:

- Todos los campos del frontmatter con tipo, si son obligatorios y descripción
- Todas las secciones Markdown con descripción de su contenido
- Reglas de naming de archivos y rutas donde deben guardarse
- Cómo funcionan las referencias cruzadas entre archivos
- Tipos de archivo válidos predefinidos por capa
- Ejemplos completos a tres niveles de detalle (mínimo, medio, completo)
- Preguntas concretas que la IA debe hacer al usuario para rellenar cada campo

### `formatos/pantallas.md`

Especificación completa del formato de los archivos de pantalla (`screens/{id}-screens.md`). Incluye lo mismo que el anterior aplicado a pantallas: campos, secciones, referencias, ejemplos y preguntas.

### `formatos/flujos.md`

Especificación completa del formato de los archivos de flujo (`flows/{id}-flows.md`). Incluye el formato simple y detallado del campo `modules`, cómo describir los pasos, casos de error, y preguntas para extraer la información del usuario.

### `formatos/base-datos.md`

Especificación completa del formato de los archivos de entidad de base de datos (`database/{id}-database.md`). Incluye el formato DBML esperado en la sección `## Table`, los tipos de datos y atributos válidos, cómo definir relaciones, y preguntas para extraer el esquema del usuario.

### `formatos/reglas.md`

Especificación completa del formato de `05-system-rules.md`. Incluye las secciones sugeridas, ejemplos de reglas por sección, y cómo distinguir qué va aquí frente a qué va en las notas de un módulo o flujo.

---

## Cómo lo usa el usuario según la IA que tenga

| IA | Instrucción |
|----|-------------|
| Claude Code / Cursor / Copilot / Codex | `"Lee ia-doc/GUIA-IA.md y ayúdame a documentar mi aplicación para CodeAtlas"` |
| Claude.ai / ChatGPT / Gemini (web) | Adjuntar `GUIA-IA.md` como archivo o copiar su contenido como primer mensaje |
| Cualquier IA con acceso a herramientas | La IA leerá `GUIA-IA.md` y, si necesita detalle de un tipo concreto, leerá el archivo correspondiente de `formatos/` |

---

## Dónde se guarda la documentación generada

La carpeta de destino por defecto para todos los archivos `.md` generados es **`app-doc/`**. La IA debe crearla si no existe antes de escribir ningún archivo. Si el usuario indica explícitamente otra carpeta, usa esa; en cualquier otro caso, `app-doc/`.

Esta decisión mantiene la documentación de la aplicación separada de las guías para la IA (`ia-doc/`), del código fuente y del resto del proyecto.

---

## Decisiones de diseño

**Por qué un archivo principal + carpeta de detalle y no todo junto:**
`GUIA-IA.md` tiene que ser copiable y pegable en cualquier chat. Si contuviera los seis formatos completos con todos sus ejemplos, superaría fácilmente las 1500 líneas y perdería efectividad. Los archivos de `formatos/` existen para las IAs que tienen acceso a herramientas y pueden leerlos cuando los necesiten.

**Por qué no reutilizar directamente los archivos de `estructura-proyecto/lector-de-archivos/`:**
Esos archivos están escritos como especificación técnica para el desarrollador. Los de `ia-doc/` están escritos como instrucciones directas para una IA: incluyen preguntas concretas que hacer al usuario, indicaciones sobre cómo manejar referencias entre archivos durante la conversación, y ejemplos de output listo para copiar. El público y el propósito son distintos.

**Por qué el orden de generación importa:**
Los archivos de pantalla referencian IDs de módulos. Los flujos referencian IDs de pantallas, módulos y entidades. Si la IA genera en orden incorrecto, usará IDs inventados que luego no coincidirán con los archivos reales, y el resolver del parser lanzará advertencias de referencias rotas. El orden correcto es: módulos → base de datos → pantallas → flujos → reglas.

---

## Estado

- [x] Crear `ia-doc/GUIA-IA.md`
- [x] Crear `ia-doc/formatos/modulos.md`
- [x] Crear `ia-doc/formatos/pantallas.md`
- [x] Crear `ia-doc/formatos/flujos.md`
- [x] Crear `ia-doc/formatos/base-datos.md`
- [x] Crear `ia-doc/formatos/reglas.md`
- [x] Añadir modo transformación a `GUIA-IA.md` (dos modos: entrevista y transformación)
- [x] Definir `app-doc/` como carpeta de destino por defecto para la documentación generada
