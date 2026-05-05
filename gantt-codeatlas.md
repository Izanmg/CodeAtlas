# Gantt inicial de CodeAtlas

Este diagrama traduce la planificación inicial a un formato visual editable en Markdown con Mermaid.

```mermaid
gantt
    title Plan inicial de CodeAtlas
    dateFormat  YYYY-MM-DD
    axisFormat  %d/%m

    section Semana 1 - Base y arranque MVP
    Definición final del proyecto                  :done, s1a, 2026-05-06, 1d
    Requisitos, UML y alcance                      :s1b, after s1a, 1d
    Arquitectura, stack y modelo de datos          :s1c, after s1b, 2d
    Planificación inicial y seguimiento            :s1d, 2026-05-06, 4d
    Arranque frontend, backend y BD                :s1e, after s1c, 2d
    Inicio parser MD y pantallas base              :s1f, after s1e, 1d

    section Semana 2 - Cierre MVP documentación
    Parser MD completo                             :s2a, 2026-05-11, 2d
    Lectura y procesado de documentos              :s2b, after s2a, 1d
    Representación visual MVP                      :s2c, after s2b, 2d
    Integración frontend backend BD                :s2d, after s2c, 1d
    Pruebas base del MVP                           :s2e, after s2d, 1d
    Memoria y manuales primer avance               :s2f, 2026-05-11, 5d

    section Semana 3 - Aplicación completa
    Análisis de aplicaciones creadas               :s3a, 2026-05-18, 2d
    Detección de archivos funciones relaciones     :s3b, after s3a, 2d
    Integración visual de la segunda funcionalidad :s3c, after s3b, 1d
    Revisión técnica y seguridad                   :s3d, 2026-05-18, 4d
    Guion y documentación avanzada                 :s3e, 2026-05-18, 4d

    section Semana 4 - Cierre entrega
    Cierre funcional completo                      :s4a, 2026-05-22, 1d
    Despliegue y validación final                  :s4b, 2026-05-22, 1d
    Memoria manuales anexos finales                :s4c, 2026-05-22, 1d
    Presentación y defensa                         :s4d, 2026-05-22, 1d
```

## Nota

Si hace falta, este mismo contenido se puede pasar después a:

- un Gantt más detallado
- una tabla CSV para importarla en otra herramienta
- Trello, Notion, ProjectLibre o similar
