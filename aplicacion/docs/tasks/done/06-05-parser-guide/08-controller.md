# 08 — parser.controller.js

## Qué hace
Recibe la petición HTTP con los archivos subidos, llama al service y devuelve la respuesta al cliente.

## Funciones

```js
export async function parseDoc(req, res) {}
export async function parseCode(req, res) {}  // placeholder, no implementado
```

## Lógica de `parseDoc`

### 1. Leer los archivos de multer

Multer deja los archivos en `req.files`. Cada archivo tiene:
- `originalname`: nombre del archivo
- `buffer`: contenido en Buffer

Conviértelos al formato que espera el service:

```js
const files = req.files.map(file => ({
  filename: file.originalname,
  content: file.buffer.toString('utf-8')
}))
```

### 2. Validar que hay archivos

Si `req.files` está vacío o no existe, devuelve `400`:

```js
res.status(400).json({ error: 'No files uploaded' })
```

### 3. Llamar al service

```js
import { parseDocumentation } from './parser.service.js'

const model = await parseDocumentation(files)
```

### 4. Devolver la respuesta

```js
res.status(200).json(model)
```

### 5. Manejo de errores

Envuelve todo en un try/catch. Distingue entre errores de validación (culpa del usuario) y errores internos del sistema:

```js
try {
  const model = await parseDocumentation(files)
  res.status(200).json(model)
} catch (error) {
  const isValidationError = error.message.startsWith('[')
  res.status(isValidationError ? 400 : 500).json({ error: error.message })
}
```

Los errores de validación del frontmatter empiezan siempre por `[nombre-archivo` — eso es suficiente para distinguirlos. Devuelven `400 Bad Request` porque el problema está en los archivos del usuario, no en el servidor.

## Lógica de `parseCode`

Por ahora solo devuelve `501 Not Implemented`:

```js
res.status(501).json({ error: 'Code parser not implemented yet' })
```
