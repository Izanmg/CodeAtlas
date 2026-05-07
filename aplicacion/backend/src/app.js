/**
 * app.js
 *
 * Builds and configures the Express application instance.
 * Registers global middleware (cors, json) and mounts module routers.
 *
 * Does not start the HTTP server — that is server.js.
 */

import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import parserRoutes from './modules/parser/parser.routes.js'

dotenv.config()

const app = express()

app.use(cors())
app.use(express.json())

// Module routes
app.use('/api/parser', parserRoutes)

export default app
