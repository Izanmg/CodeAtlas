/**
 * server.js
 *
 * Arranca el servidor HTTP en el puerto definido por la variable de
 * entorno PORT (por defecto 3000).
 *
 * Su única responsabilidad es escuchar peticiones — toda la configuración
 * de Express vive en app.js.
 */

import app from './app.js'

const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`)
})
