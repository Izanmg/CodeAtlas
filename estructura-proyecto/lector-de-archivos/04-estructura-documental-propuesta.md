# Propuesta de estructura documental del lector

## Objetivo
Dejar definida una primera propuesta clara de estructura de carpetas y archivos Markdown para que CodeAtlas pueda leer la documentación de una aplicación de forma ordenada.

## Idea general
La propuesta base es trabajar con un conjunto de archivos Markdown organizados por bloques funcionales.

Cada bloque tendría primero un documento resumen y, cuando haga falta más detalle, una carpeta con archivos específicos por elemento.

La intención es que el sistema sea suficientemente estructurado para que la aplicación lo pueda interpretar bien, pero sin convertirlo en un formato innecesariamente complejo.

## Estructura base propuesta

### 1. Documento inicial de visión general
Debe existir un primer documento que explique lo básico de la aplicación.

Este documento serviría para entender rápidamente:

- la finalidad de la aplicación
- el problema que resuelve
- el enfoque general
- el stack o lenguajes usados
- una visión breve de cómo se organiza el proyecto

Este archivo actuaría como punto de entrada principal de toda la documentación.

## 2. Documento de módulos
Después habría un segundo documento dedicado a los módulos de la aplicación.

Este documento actuaría como índice funcional general.

En él se listarían los módulos principales, uno detrás de otro, con una explicación breve de qué hace cada uno.

## 3. Carpeta de módulos
A partir del documento de módulos, existiría una carpeta específica de módulos.

Dentro de esa carpeta habría un archivo Markdown por cada módulo definido en el documento general.

Cada uno de esos archivos serviría para desarrollar con más detalle:

- el objetivo del módulo
- las pantallas que incluye
- las funciones principales que tiene
- las relaciones que puede tener con otros módulos

## 4. Bloque de pantallas
Para seguir el mismo patrón, se añadiría una parte específica de pantallas.

Lo recomendable es tener:

- un documento general de pantallas
- una carpeta de pantallas con un archivo por cada pantalla importante

Esto permitiría describir para cada pantalla:

- qué muestra
- qué acciones permite
- de qué módulo depende
- qué papel cumple dentro de la aplicación

## 5. Bloque de flujos
También conviene añadir un bloque de flujos funcionales.

La idea sería mantener la misma lógica:

- un documento general de flujos
- una carpeta de flujos con un archivo por cada flujo importante

Por ejemplo, aquí podrían describirse flujos como:

- login
- registro
- creación de proyecto
- lectura de documentación
- generación de visualización

Esto ayuda a entender el comportamiento de la aplicación sin mezclarlo todo dentro de los módulos.

## 6. Bloque de bases de datos
En lugar de un apartado genérico de datos, se plantea usar un bloque específico de bases de datos.

También seguiría la misma estructura:

- un documento general de bases de datos
- una carpeta de bases de datos con archivos por entidad o bloque relevante si hace falta más detalle

Aquí se recogería información como:

- tablas o colecciones principales
- relaciones entre entidades
- campos importantes
- propósito de cada entidad dentro de la aplicación

La idea no es entrar desde el principio en un nivel excesivamente técnico, sino dejar clara la estructura base de la persistencia del sistema.

## 7. Bloque de reglas o decisiones globales
Por último, conviene añadir un bloque para reglas generales o decisiones globales del sistema.

Este apartado serviría para recoger cosas que afectan a toda la aplicación y que no conviene repetir en múltiples documentos.

Por ejemplo:

- permisos
- navegación
- convenciones
- validaciones
- restricciones generales
- decisiones técnicas transversales

## Estructura concreta propuesta
Para que esta idea pueda visualizarse como una estructura real de carpetas y archivos, una propuesta lógica sería esta:

```text
project-docs/
├── 00-overview.md
├── 01-modules.md
├── 02-screens.md
├── 03-flows.md
├── 04-database.md
├── 05-system-rules.md
├── modules/
│   ├── auth-modules.md
│   ├── project-management-modules.md
│   ├── documentation-reader-modules.md
│   └── diagram-generation-modules.md
├── screens/
│   ├── login-screens.md
│   ├── register-screens.md
│   ├── dashboard-screens.md
│   ├── project-detail-screens.md
│   └── documentation-import-screens.md
├── flows/
│   ├── user-login-flows.md
│   ├── user-registration-flows.md
│   ├── project-creation-flows.md
│   ├── documentation-reading-flows.md
│   └── diagram-generation-flows.md
└── database/
    ├── users-database.md
    ├── projects-database.md
    ├── documents-database.md
    └── diagrams-database.md
```

## Criterio de nombres
La lógica de nombres propuesta busca que cada carpeta y archivo indique su finalidad de forma evidente.

Además, se propone una regla fija para los archivos de detalle: el nombre debe empezar por el identificador definido por el usuario para ese elemento y terminar con el mismo nombre de la carpeta en la que está.

La fórmula sería esta:

`nombre-del-elemento` + `-` + `nombre-de-la-carpeta` + `.md`

Por ejemplo:

- en `flows/`: `user-login-flows.md`
- en `screens/`: `login-screens.md`
- en `modules/`: `auth-modules.md`
- en `database/`: `users-database.md`

Así, cuando se vea el archivo, se sabrá enseguida qué elemento representa y a qué zona de la estructura pertenece.

### Documentos principales
- `00-overview.md`: documento principal de contexto general
- `01-modules.md`: índice de módulos
- `02-screens.md`: índice de pantallas
- `03-flows.md`: índice de flujos
- `04-database.md`: visión general de la base de datos
- `05-system-rules.md`: reglas y decisiones globales del sistema

El uso de numeración ayuda a mantener un orden estable y fácil de entender tanto para personas como para la aplicación.

### Carpetas de detalle

#### `modules/`
La carpeta `modules/` contiene el desarrollo en detalle de cada módulo funcional definido en `01-modules.md`.

La idea de esta carpeta es que cada archivo represente un módulo concreto de la aplicación y permita entenderlo sin depender solo del resumen general.

Por ejemplo:

- `auth-modules.md`
- `project-management-modules.md`
- `documentation-reader-modules.md`
- `diagram-generation-modules.md`

Cada uno de estos archivos debería explicar con más profundidad:

- cuál es el objetivo del módulo
- qué problema resuelve dentro de la aplicación
- qué pantallas se relacionan con él
- qué funciones principales incluye
- con qué otros módulos interactúa

Así, si alguien quiere entender solo el módulo de autenticación o solo el lector de documentación, puede ir directamente a ese archivo sin tener que reconstruir toda la información desde otros documentos.

#### `screens/`
La carpeta `screens/` contiene un archivo por cada pantalla importante de la aplicación.

Su función es describir la interfaz desde un punto de vista más concreto y visual, separando cada vista relevante en su propio documento.

Por ejemplo:

- `login-screens.md`
- `register-screens.md`
- `dashboard-screens.md`
- `project-detail-screens.md`
- `documentation-import-screens.md`

Dentro de estos archivos se podría explicar:

- qué muestra la pantalla
- qué acciones permite hacer al usuario
- de qué módulo depende
- qué información recibe o presenta
- qué papel cumple en el flujo general de la aplicación

Esto ayuda a que la estructura no se quede solo en módulos abstractos, sino que también refleje cómo se materializa la aplicación en la interfaz.

#### `flows/`
La carpeta `flows/` contiene el detalle de los flujos funcionales importantes del sistema.

Su objetivo es explicar procesos completos paso a paso, en lugar de centrarse solo en módulos o pantallas aisladas.

Por ejemplo:

- `user-login-flows.md`
- `user-registration-flows.md`
- `project-creation-flows.md`
- `documentation-reading-flows.md`
- `diagram-generation-flows.md`

Cada uno de estos archivos podría describir:

- qué inicia el flujo
- qué pasos sigue el usuario o el sistema
- qué pantallas intervienen
- qué módulos participan
- qué resultado final produce el flujo

Esto es especialmente útil para entender comportamientos completos, porque permite ver cómo se conectan entre sí distintas partes de la aplicación.

#### `database/`
La carpeta `database/` contiene el detalle de la estructura de base de datos o de persistencia del sistema.

En esta carpeta, cada archivo representa una entidad importante o un bloque relevante de información que la aplicación necesita guardar.

Por ejemplo:

- `users-database.md`
- `projects-database.md`
- `documents-database.md`
- `diagrams-database.md`

Dentro de estos archivos se podría explicar:

- qué representa cada entidad
- para qué sirve dentro de la aplicación
- qué campos importantes tiene
- con qué otras entidades se relaciona
- qué papel cumple dentro de la lógica del sistema

Así, la carpeta no se entiende como un sitio donde meter SQL sin más, sino como una forma clara de documentar la base de datos de manera comprensible y reutilizable.

### Archivos internos de cada carpeta
Dentro de cada carpeta, los archivos se nombran según el elemento que describen y su finalidad.

Eso permite identificar el contenido de cada archivo incluso fuera de su contexto original.

Por ejemplo:

- `auth-modules.md`: módulo de autenticación dentro de `modules/`
- `login-screens.md`: pantalla de login dentro de `screens/`
- `user-login-flows.md`: flujo de inicio de sesión dentro de `flows/`
- `users-database.md`: entidad de usuarios dentro de `database/`

Este patrón hace que cada archivo se pueda identificar sin ambigüedad incluso fuera de su carpeta.

## Resumen de la propuesta
La estructura base quedaría así:

1. un documento principal de visión general
2. un documento índice para módulos
3. una carpeta `modules/` con un archivo por módulo
4. un documento índice para pantallas y una carpeta `screens/`
5. un documento índice para flujos y una carpeta `flows/`
6. un documento índice de base de datos y una carpeta `database/`
7. un documento de reglas globales del sistema

## Valor de esta estructura
Esta propuesta mantiene una lógica uniforme:

- primero un documento resumen por bloque
- después una carpeta con archivos detallados cuando haga falta
- nombres directos, predecibles y alineados con la finalidad de cada archivo

Eso hace que la documentación sea más fácil de:

- leer por personas
- mantener con orden
- ampliar en el futuro
- interpretar por CodeAtlas

## Siguiente paso natural
Una vez validada esta estructura concreta, el siguiente paso sería definir la plantilla o contenido mínimo que debería tener cada tipo de Markdown.