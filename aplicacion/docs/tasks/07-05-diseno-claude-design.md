# Diseño de la aplicación con Claude Design

## Qué estamos haciendo

Se está desarrollando el diseño completo de la interfaz de CodeAtlas usando **Claude Design**.

Claude Design produce prototipos de alta fidelidad interactivos en HTML. Cuando el diseño esté validado, preparará un paquete de handoff para que Claude Code lo implemente en Vue 3 + Tailwind CSS.

## Prompt usado

El prompt completo está en:

```
aplicacion/docs/tasks/07-05-prompt-claude-design.md
```

## Qué cubre el diseño

- Identidad visual: logo (PNG, dos versiones) y paleta de colores completa
- Login y registro
- Dashboard con listado de proyectos
- Crear proyecto
- Detalle de proyecto con listado de diagramas
- Crear diagrama (subida de archivos `.md`)
- Vista del diagrama (canvas interactivo con nodos y conexiones)
- Configuración de cuenta

El proyecto "CodeAtlas" aparece por defecto con un diagrama ya generado de la propia arquitectura de la app.

## Estado

En progreso.
