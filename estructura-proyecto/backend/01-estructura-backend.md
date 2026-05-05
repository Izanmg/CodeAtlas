# Estructura del backend

## Base técnica
El backend se hará con Node.js y expondrá una API web.

## Objetivo
Centralizar la lógica de negocio, el acceso a base de datos y el procesamiento de los datos que usa el frontend.

## Enfoque modular
El backend se organizará por módulos.

## Módulos iniciales previstos
- módulo de autenticación
- módulo de usuarios
- módulo de proyectos
- módulo de lector de archivos
- módulo de representación o datos del diagrama

## Idea de API
Habrá endpoints separados por responsabilidad. Por ejemplo:
- API de login
- API de usuarios
- API de proyectos
- API de lectura o procesamiento de archivos
- API de obtención del diagrama y acciones relacionadas

## Ventaja de este enfoque
Permite crecer sin mezclar toda la lógica en una sola parte del sistema.
