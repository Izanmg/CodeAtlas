/**
 * app.js
 *
 * Crea y configura la instancia de Express.
 * Registra los middlewares globales (cors, json) y monta los routers de los módulos.
 *
 * No arranca el servidor HTTP — esa responsabilidad es de server.js.
 */

import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import parserRoutes from './modules/parser/parser.routes.js'

dotenv.config()

const app = express()

app.use(cors())
app.use(express.json())

// Rutas de los módulos
app.use('/api/parser', parserRoutes)

export default app
