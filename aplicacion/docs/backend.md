# Backend

## Stack
- Node.js + Express
- ES Modules (`import/export`)

## Arrancar
```bash
cd aplicacion/backend
npm run dev
```
Corre en `http://localhost:3000`. Nodemon reinicia el servidor automáticamente al guardar cambios.

## Estructura
```
backend/
└── src/
    ├── modules/
    │   ├── auth/
    │   ├── projects/
    │   └── parser/
    │       ├── core/
    │       └── sources/
    ├── app.js
    └── server.js
```

## Archivos de entrada
- **`server.js`**: arranca el servidor HTTP en el puerto definido en `.env` (por defecto 3000)
- **`app.js`**: crea la instancia de Express y registra middlewares y rutas

## Estructura interna de los módulos

Todos los módulos siguen el mismo esquema de archivos:

| Archivo | Responsabilidad |
|---------|----------------|
| `[modulo].routes.js` | Define los endpoints del módulo y los conecta con el controller |
| `[modulo].controller.js` | Recibe la petición HTTP, llama al service y devuelve la respuesta |
| `[modulo].service.js` | Contiene la lógica de negocio del módulo |
| `[modulo].repository.js` | Gestiona las consultas a la base de datos |

Ejemplo para el módulo `auth`:
```
auth/
├── auth.routes.js
├── auth.controller.js
├── auth.service.js
└── auth.repository.js
```

## Módulos

### auth
Gestiona autenticación y sesiones de usuario.

### projects
Gestiona los proyectos del usuario.

### parser
Lee archivos de documentación y genera el modelo JSON unificado.
Además del esquema estándar de módulo, contiene dos subcarpetas propias:
- `core/`: lógica compartida (parseo YAML, construcción del modelo, resolución de referencias)
- `sources/`: extractores por tipo de fuente (Markdown, código)

## Dependencias
| Paquete | Uso |
|---------|-----|
| `express` | Framework web |
| `cors` | Habilita CORS para que el frontend pueda conectar |
| `dotenv` | Variables de entorno desde `.env` |
| `js-yaml` | Parseo de YAML en el módulo parser |
| `multer` | Recepción de archivos subidos por el usuario |
| `nodemon` | Reinicio automático en desarrollo |
