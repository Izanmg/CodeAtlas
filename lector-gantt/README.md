# Lector Gantt

Pequeño visor web para representar el Gantt de CodeAtlas a partir de `../gantt-projectlibre.csv`.

## Cómo usarlo

1. Abre `index.html` en un navegador.
2. Si el navegador no permite cargar automáticamente el CSV local, usa el botón **Cargar CSV...** y selecciona `gantt-projectlibre.csv`.
3. Usa el toggle de dependencias para mostrar u ocultar relaciones básicas entre tareas.

## Archivos

- `index.html`: estructura de la interfaz
- `style.css`: estilos del visor
- `app.js`: parser del CSV y renderizado del Gantt

Este visor está pensado para generar una vista clara del diagrama de Gantt del proyecto.
