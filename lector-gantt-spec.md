# Spec: lector Gantt para CodeAtlas

## Objetivo
Crear una pequeña aplicación web dentro del proyecto `CodeAtlas` para visualizar de forma clara un diagrama de Gantt a partir de un archivo de entrada ya generado por el proyecto.

## Ubicación
La aplicación debe crearse dentro de:

- `/home/izan/codeatlas/lector-gantt`

Todo el trabajo debe quedar dentro de la carpeta `CodeAtlas`.

## Finalidad
Esta aplicación no pretende ser un gestor de proyectos completo.
Su objetivo es servir como visor sencillo, claro y editable para representar el Gantt del proyecto y poder sacar una vista visual limpia para revisar o capturar.

## Tecnologías preferidas
Priorizar una solución simple basada sobre todo en:

- HTML
- CSS
- JavaScript o TypeScript

Evitar complejidad innecesaria. Si hace falta usar una librería pequeña para renderizar mejor la línea temporal, puede valorarse, pero la prioridad es mantenerlo fácil de entender, fácil de modificar y ligero.

## Entrada
La aplicación debe poder leer como mínimo uno de estos formatos:

1. `gantt-projectlibre.csv`
2. `gantt-final.md`

La prioridad principal es soportar bien el CSV, porque es el formato más estructurado.

## Qué debe hacer
La aplicación debería:

- cargar el archivo CSV del Gantt
- interpretar tareas, fechas, duración y dependencias básicas
- mostrar una lista de tareas en una columna lateral
- mostrar una línea temporal visual con barras por tarea
- distinguir al menos visualmente tareas normales e hitos si aparecen
- permitir una visualización limpia y clara para captura o revisión

## Alcance mínimo aceptable
La primera versión debe ser funcional aunque sea sencilla.

Mínimo esperado:

- interfaz web local funcional
- lectura del CSV
- renderizado básico de tareas en una línea temporal
- nombres de tareas visibles
- fechas comprensibles
- diseño suficientemente limpio para hacer una captura

## Alcance deseable
Si da tiempo y sale natural, también sería útil:

- agrupar por bloques o secciones
- resaltar hitos
- colorear tareas por tipo o grupo
- mostrar dependencias básicas
- permitir cambiar fácilmente el archivo de entrada

## Restricciones
- No convertir esto en un producto enorme.
- No perder tiempo en features secundarias.
- Priorizar simplicidad, claridad y rapidez.
- El código debe quedar entendible para una persona que domina mejor HTML, JS/TS y CSS que stacks raros.

## Entregable esperado
Dentro de `lector-gantt` debería quedar algo como:

- `index.html`
- archivos CSS/JS o TS necesarios
- si hace falta, un pequeño README explicando cómo abrirlo o probarlo

## Criterio de éxito
Se considera buen resultado si, al abrir la app, se puede visualizar el Gantt del proyecto de forma clara a partir del CSV ya generado en el repositorio.
