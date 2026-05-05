# Formato propuesto para `doc-diagram`

## Idea base
Sí, tiene sentido que un proyecto no dependa de un único Markdown gigante.

La propuesta es usar varios archivos `.md`, donde cada uno tenga una responsabilidad concreta.

Así la aplicación puede leerlos por separado, entender mejor cada bloque y luego unir todo en un único modelo interno del proyecto.

## Enfoque recomendado
Un `doc-diagram` puede construirse a partir de una carpeta con varios `.md`.

Por ejemplo:

- `00-project.md`
- `10-modules.md`
- `20-screens.md`
- `30-flows.md`
- `40-data-model.md`
- `50-relations.md`

## Qué haría cada archivo
### `00-project.md`
Información general del proyecto.

Puede incluir:
- nombre
- descripción
- objetivo
- tipo de aplicación

### `10-modules.md`
Lista de módulos principales.

Por ejemplo:
- autenticación
- proyectos
- diagramas
- usuarios

### `20-screens.md`
Pantallas o vistas de la aplicación.

Por ejemplo:
- login
- registro
- dashboard de proyectos
- vista de proyecto
- settings

### `30-flows.md`
Flujos funcionales.

Por ejemplo:
- registro de usuario
- login
- creación de proyecto
- carga de documentación
- generación de diagrama

### `40-data-model.md`
Entidades de base de datos o estructuras de datos principales.

Por ejemplo:
- usuario
- proyecto
- diagrama
- fuente

### `50-relations.md`
Relaciones entre módulos, pantallas, entidades o flujos.

## Ventajas de este enfoque
- más orden
- más fácil de leer
- más fácil de parsear
- más escalable
- más modular
- más fácil de mantener

## Cómo lo leería la aplicación
### Paso 1
El usuario sube una carpeta o conjunto de archivos `.md`.

### Paso 2
El backend identifica cada archivo por nombre o por metadatos.

### Paso 3
Cada archivo se parsea con reglas propias.

### Paso 4
Toda la información se une en un modelo interno común.

### Paso 5
Con ese modelo se genera el `doc-diagram`.

## Recomendación importante
No conviene dejar que cada archivo tenga cualquier formato.

Cada uno debería seguir una estructura predecible.

Por ejemplo:
- títulos claros
- bloques definidos
- listas o tablas simples
- nombres consistentes

## Posible regla general
Cada archivo puede empezar con una pequeña cabecera como esta:

```md
# Project
Type: project
Name: CodeAtlas
```

O bien usar secciones muy claras y repetibles.

## Decisión práctica por ahora
La mejor base es:
- varios `.md`
- un archivo por bloque funcional
- nombres de archivo fijos o muy predecibles
- estructura interna simple y repetible

## Siguiente paso lógico
Definir el contenido exacto de `00-project.md` y `10-modules.md` para tener ya la primera plantilla real del sistema.
