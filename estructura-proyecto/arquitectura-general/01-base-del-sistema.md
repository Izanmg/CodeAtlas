# Base del sistema

## Decisión principal
CodeAtlas se construirá como una aplicación web separada en dos partes:
- `frontend`
- `backend`

## Stack elegido
- Frontend: Vue con Vite
- Backend: Node.js

## Enfoque de arquitectura
La estructura general será modular.

Cada módulo debe ser lo más independiente posible del resto para permitir:
- mantener el proyecto con más facilidad
- añadir funcionalidades sin romper la base
- incorporar autenticación y multiusuario sin rehacer todo
- ampliar la aplicación en el futuro

## Módulos base previstos
- autenticación y usuarios
- proyectos
- lector de archivos
- representación visual
- configuración de usuario

## Principio técnico
Cada bloque funcional debe tener su propia responsabilidad clara y comunicarse con el resto mediante interfaces bien definidas, principalmente a través de la API del backend.
