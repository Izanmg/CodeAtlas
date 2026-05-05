# Proyectos

## Objetivo
Cada usuario debe poder ver y gestionar sus propios proyectos.

## Decisión importante
Un proyecto no es lo mismo que un diagrama.

A partir de esta decisión:
- un proyecto será la entidad contenedora principal
- cada proyecto podrá tener varios diagramas
- los diagramas pertenecerán a un proyecto

Esto permite que un mismo proyecto evolucione con distintas representaciones a lo largo del tiempo.

## Ejemplo de enfoque
Dentro de un proyecto podrían existir varios diagramas, por ejemplo:
- un diagrama generado desde documentación estructurada en `.md`
- un diagrama generado a partir del análisis de una aplicación ya desarrollada

## Listado de proyectos
Después del login, el usuario verá un panel con sus proyectos.

## Formato visual pensado
Tarjetas rectangulares o cuadradas con una vista previa del proyecto.

Cada tarjeta puede incluir:
- nombre del proyecto
- miniatura o preview de uno de sus diagramas
- información básica del proyecto
- estado o fecha si interesa añadirlo después

## Vista individual de proyecto
Al entrar en un proyecto, la pantalla se divide en dos partes:
- izquierda: diagrama principal grande
- derecha: acciones, herramientas y operaciones disponibles

Dentro del proyecto, el usuario podrá cambiar entre los distintos diagramas asociados a ese proyecto.

## Configuración de proyecto
También conviene reservar una parte de configuración propia del proyecto.

Más adelante podrá incluir opciones como:
- nombre del proyecto
- descripción
- tipo principal de proyecto
- preferencias de visualización
- datos técnicos o metadatos

## Posibles acciones futuras
- cargar archivos `.md`
- generar nuevos diagramas dentro del proyecto
- cambiar entre diagramas
- regenerar diagrama
- editar definición
- guardar cambios
- lanzar análisis o transformaciones
