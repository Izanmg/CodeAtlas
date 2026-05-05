# Entidades principales de base de datos

## Objetivo
Cubrir los requisitos mínimos técnicos y preparar una base de datos útil para la aplicación.

## Entidades mínimas ya visibles
### 1. Usuario
Datos básicos de la cuenta.

Campos iniciales planteados:
- id
- username
- password_hash
- birth_date
- created_at
- updated_at

### 2. Proyecto
Cada proyecto pertenece a un usuario y actúa como contenedor principal.

Campos iniciales planteados:
- id
- user_id
- name
- description
- preview_image
- settings_json
- created_at
- updated_at

### 3. Diagrama
Cada proyecto puede tener varios diagramas.

Esta entidad separa claramente el proyecto de sus representaciones visuales.

Campos iniciales planteados:
- id
- project_id
- name
- diagram_type
- preview_image
- created_at
- updated_at

## Nombres elegidos para los tipos de diagrama
Los nombres acordados por ahora son:

- `doc-diagram`
- `application-diagram`

## Significado de cada tipo
- `doc-diagram`: diagrama generado desde documentación estructurada, por ejemplo archivos `.md`
- `application-diagram`: diagrama generado desde el análisis de una aplicación ya desarrollada

## Entidad adicional recomendable
### 4. Fuente o contenido del diagrama
Aquí habrá que decidir si guardamos:
- los archivos `.md` originales
- el contenido interpretado por la aplicación
- o ambas cosas

Campos iniciales posibles:
- id
- diagram_id
- source_type
- raw_content
- parsed_content
- created_at
- updated_at

## Relación mínima
- un usuario tiene muchos proyectos
- un proyecto tiene muchos diagramas
- un diagrama puede tener una o varias fuentes de definición

Con esto ya hay varias entidades relacionadas y además la estructura queda mucho más coherente con la evolución real de CodeAtlas.

## Decisiones pendientes
- definir el nombre final de cada tipo de diagrama
- definir si conviene guardar el archivo original, la interpretación interna o las dos cosas
- definir qué ajustes propios tendrá cada proyecto
