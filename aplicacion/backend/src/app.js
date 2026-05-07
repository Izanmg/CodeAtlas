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
import parserRoutes    from './modules/parser/parser.routes.js'
import authRoutes      from './modules/auth/auth.routes.js'
import projectsRoutes  from './modules/projects/projects.routes.js'
import diagramsRoutes  from './modules/diagrams/diagrams.routes.js'
import settingsRoutes  from './modules/settings/settings.routes.js'

dotenv.config()

const app = express()

app.use(cors())
app.use(express.json())

// Rutas de los módulos
app.use('/api/auth',     authRoutes)
app.use('/api/projects', projectsRoutes)
app.use('/api',          diagramsRoutes)
app.use('/api/parser',   parserRoutes)
app.use('/api/settings', settingsRoutes)

export default app
