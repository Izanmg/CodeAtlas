# Backend — Parser: partes pendientes

Este archivo lista lo que **no está implementado todavía** del task `06-05-backend-parser.md`. Todo lo demás del documento está creado y verificado funcionalmente.

---

## 1. Persistencia en base de datos

**Estado**: implementado como placeholder en memoria.

El task dice:
> `parser.repository.js` — Guarda el modelo JSON generado en la base de datos asociado al proyecto

La implementación actual de `parser.repository.js` usa una variable en memoria (`storedModel`) en lugar de una base de datos real. Esto es porque la base de datos aún no está configurada en el proyecto.

**Por qué se aceptó así**: las firmas de las funciones (`saveModel`, `getModel`) son las mismas que necesitará la implementación con BD. Cuando se configure la base de datos, solo habrá que modificar el cuerpo de estas dos funciones — el service no necesita cambios.

**Qué falta**:
- Configurar la base de datos del proyecto (esquema, conexión, ORM o cliente)
- Sustituir la implementación en memoria por consultas reales a BD
- Asociar el modelo guardado al proyecto del usuario (tabla con `project_id` o similar)

---

## 2. Code parser

**Estado**: el endpoint existe pero devuelve `501 Not Implemented`.

El task ya dice expresamente:
> Por ahora solo se desarrolla `POST /api/parser/doc`. El endpoint de código queda reservado para el siguiente avance.

Por tanto, esta no es una desviación del plan — es lo previsto. Está apuntado aquí solo como recordatorio de qué hace falta para completar el code parser cuando llegue su momento:

- Crear `sources/code-source.js` que:
  - Localice bloques `/** @codeatlas ... */` en archivos de código
  - Elimine los `*` iniciales de cada línea
  - Convierta cada bloque en un string con formato `.md` válido
  - Pase los strings resultantes a `markdown-source.js` y devuelva su resultado
- Implementar `parseCode` en `parser.controller.js` (actualmente devuelve 501)

El resto del pipeline (yaml-parser, validator, model-builder, resolver, repository) ya soporta el code parser sin cambios.

---

## Lo que sí está implementado y verificado

- Estructura completa de archivos del módulo (incluidos los añadidos durante el diseño: `sections.config.js`, `frontmatter.config.js`, `validator.js`)
- Endpoint `POST /api/parser/doc` con multer
- Pipeline completo: extract → parse YAML → validate → build model → resolve references
- Orden de procesamiento de archivos (índice de módulos primero, system-rules último)
- Validación del frontmatter con mensajes de error que indican archivo y línea
- Errores de YAML con code frame (línea + flecha apuntando al problema)
- Separación entre secciones esperadas y extensiones (`extensions: {}` en cada elemento del modelo)
- Resolver con warnings por consola para referencias rotas
- Distinción 400 (error del usuario) vs 500 (error del sistema) en el controller
- Módulo registrado en `app.js` bajo `/api/parser`

Test funcional realizado con un proyecto de ejemplo: el parser produce el modelo JSON unificado esperado, captura las extensiones correctamente y emite warnings para las referencias rotas.
