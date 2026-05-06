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

---

## Cómo funciona el sistema

El flujo principal de CodeAtlas es el siguiente:

```
Archivos .md  →  Parser (backend)  →  JSON  →  Frontend muestra el diagrama
```

1. El usuario sube sus archivos de documentación (`.md`)
2. El backend los parsea y genera un modelo JSON con la estructura de la aplicación documentada
3. El frontend recibe ese JSON y lo representa como un diagrama visual

---

## Persistencia

El sistema guarda en base de datos el JSON generado por el parser. No es necesario guardar los archivos `.md` — el usuario siempre los tiene en local y puede volver a subirlos cuando quiera actualizar.

El flujo de actualización es siempre el mismo:

```
Usuario sube archivos .md  →  parser  →  JSON sobreescribe el anterior  →  diagrama actualizado
```
