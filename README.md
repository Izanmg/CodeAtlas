# CodeAtlas

## Qué es

CodeAtlas es una herramienta pensada para ayudar en el desarrollo de aplicaciones mediante representaciones visuales de su estructura, su lógica y su documentación.

Su objetivo es transformar información técnica en vistas más claras y útiles para facilitar la planificación, la comprensión y la validación de software.

## Problema que quiere resolver

Desarrollar software implica manejar mucha información repartida entre archivos, funciones, módulos, clases, relaciones internas, base de datos y documentación.

Entender todo eso de forma rápida no siempre es fácil. Muchas veces hay que invertir demasiado tiempo en leer código, revisar archivos sueltos o construir diagramas manualmente para hacerse una idea clara de cómo está pensada una aplicación o de cómo funciona realmente.

Además, con el desarrollo asistido por inteligencia artificial aparece otro problema importante: la IA puede generar código muy rápido, pero luego hace falta entender con claridad qué ha construido exactamente para poder revisarlo y validarlo con criterio.

CodeAtlas nace para reducir esa fricción y convertir esa complejidad en representaciones visuales más fáciles de entender.

## Valor que aporta

La propuesta de valor de CodeAtlas es ayudar a comprender mejor una aplicación sin depender únicamente de leer archivos uno por uno.

La herramienta busca ofrecer una visión más clara, visual y navegable del sistema, algo útil tanto para diseñar una aplicación antes de construirla como para entender una aplicación que ya existe.

## Qué puede representar

Entre los elementos que podría representar se encuentran:

- estructura general del proyecto
- módulos y relaciones entre módulos
- archivos y funciones
- clases y relaciones entre clases
- flujos de funcionamiento
- casos de uso
- base de datos y relaciones entre tablas

## Casos de uso

Algunos casos de uso claros para CodeAtlas serían:

- definir visualmente una aplicación antes de desarrollarla
- documentar la estructura prevista de un sistema durante su planificación
- entender una aplicación ya construida sin revisar manualmente todo el código
- visualizar relaciones entre archivos, funciones, módulos o partes de la base de datos
- revisar con más claridad cambios o resultados generados por agentes de programación o inteligencia artificial

## Funcionalidades previstas

### 1. Diseño visual a partir de documentación estructurada

La primera funcionalidad de la aplicación será permitir trabajar a partir de archivos `.md` con un formato que se definirá específicamente para CodeAtlas.

Estos archivos servirán para describir cómo va a ser una aplicación antes de que esté desarrollada del todo, o mientras todavía se está planificando. Un mismo archivo, o varios archivos relacionados entre sí, podrán explicar la estructura prevista del sistema, sus módulos, sus pantallas, sus relaciones, su lógica general y otros elementos importantes del diseño.

A partir de esa documentación estructurada, CodeAtlas podrá representar visualmente la aplicación en una interfaz web, ayudando a ver de forma más clara cómo va a estar organizada incluso antes de que exista el código final.

### 2. Visualización de aplicaciones ya creadas

La segunda funcionalidad estará pensada para cuando la aplicación ya exista y ya esté desarrollada.

En este caso, la finalidad será similar a la del primer apartado, porque también buscará representar la aplicación de forma gráfica, pero con una diferencia importante: aquí no se tratará de visualizar una idea o un diseño previsto, sino de mostrar cómo es realmente la aplicación en su estado actual.

La idea es que CodeAtlas pueda ayudar a entender qué clases, funciones, archivos, relaciones, módulos y estructuras existen de verdad dentro de un proyecto ya construido, para que resulte mucho más fácil comprenderlo, revisarlo y validarlo sin tener que inspeccionar manualmente todo el código.

## Diseño técnico inicial

El enfoque inicial más realista es construir primero la parte basada en documentación estructurada. Es decir, que la aplicación pueda leer archivos definidos con un formato concreto y transformarlos en una representación visual dentro de la web.

Para una fase posterior, orientada al análisis de aplicaciones existentes, se contemplan varias posibilidades:

- análisis automático del código
- apoyo de inteligencia artificial para interpretar relaciones y estructura
- uso de documentación incrustada o anotaciones en funciones y archivos
- enfoque mixto entre análisis técnico y enriquecimiento mediante IA

La opción más razonable a nivel técnico parece ser un enfoque mixto: aprovechar información estructurada del proyecto, anotaciones o documentación clara cuando exista, y apoyarse en análisis adicional para transformar todo eso en un formato que la aplicación pueda entender y representar.

## Forma de trabajo prevista con agentes de programación

Una forma especialmente potente de usar CodeAtlas sería integrarlo en flujos de trabajo con agentes de programación, por ejemplo Claude Code, Codex u otros similares.

La idea es definir un skill o una regla de trabajo específica para esos agentes, de forma que no solo modifiquen el código, sino que también mantengan actualizada la documentación estructurada que CodeAtlas necesita para representar la aplicación visualmente.

Así, a medida que el proyecto crece o cambia, el propio agente podría ir actualizando esa documentación en el formato esperado por la aplicación, reduciendo la carga manual del desarrollador y manteniendo sincronizados el código y su representación visual.

## Enfoque MVP actual

Para mantener un alcance realista, el MVP se centrará primero en una sola parte del producto: leer archivos `.md` con el formato definido para CodeAtlas y usarlos para visualizar la aplicación de forma gráfica en la interfaz web.

Es decir, en esta primera versión no se abordará todavía el análisis completo de aplicaciones ya construidas, sino la capacidad de representar visualmente una aplicación a partir de documentación estructurada.
