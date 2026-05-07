# 10 — Registrar el módulo en app.js

## Qué hacer

Importa el router del módulo parser en `app.js` y regístralo bajo el prefijo `/api/parser`:

```js
import parserRoutes from './modules/parser/parser.routes.js'

app.use('/api/parser', parserRoutes)
```

## Resultado

Los endpoints quedan disponibles en:

```
POST http://localhost:3000/api/parser/doc
POST http://localhost:3000/api/parser/code
```

## app.js completo tras el cambio

```js
import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import parserRoutes from './modules/parser/parser.routes.js'

dotenv.config()

const app = express()

app.use(cors())
app.use(express.json())

app.use('/api/parser', parserRoutes)

export default app
```
