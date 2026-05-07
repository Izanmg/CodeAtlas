# 09 — parser.routes.js

## Qué hace
Define los endpoints del módulo parser y aplica el middleware de multer para recibir los archivos subidos.

## Configuración de multer

Usa `multer` con almacenamiento en memoria (`memoryStorage`) para que los archivos estén disponibles en `req.files` como Buffers, sin escribirlos en disco:

```js
import multer from 'multer'

const upload = multer({ storage: multer.memoryStorage() })
```

## Endpoints

```js
import { Router } from 'express'
import { parseDoc, parseCode } from './parser.controller.js'

const router = Router()

router.post('/doc', upload.array('files'), parseDoc)
router.post('/code', upload.array('files'), parseCode)

export default router
```

- El campo del formulario se llama `files` (el frontend enviará los archivos bajo ese nombre)
- `upload.array('files')` acepta múltiples archivos bajo el mismo campo
