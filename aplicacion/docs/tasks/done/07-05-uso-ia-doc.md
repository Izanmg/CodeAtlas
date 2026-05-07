# Uso de ia-doc/ para documentar CodeAtlas

## Qué estamos haciendo

Estamos usando el propio sistema de `ia-doc/` de CodeAtlas para generar la documentación de CodeAtlas.

Es decir: la herramienta que estamos construyendo para que los usuarios documenten sus aplicaciones la estamos usando nosotros mismos para documentar esta misma aplicación.

## Estado actual

Se ha generado la documentación del backend en `app-doc/` con lo que está desarrollado hasta ahora:

- `app-doc/01-modules.md` — índice de módulos (solo backend, un módulo)
- `app-doc/modules/backend/parser-backend-modules.md` — módulo parser completo

A medida que se desarrollen nuevos módulos (auth, projects) y el frontend, se irán añadiendo los archivos correspondientes siguiendo el mismo formato.
