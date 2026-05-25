/**
 * db.js
 *
 * Punto único de conexión a la base de datos MySQL. Crea un "pool" de conexiones
 * reutilizables y lo exporta para que todos los repositorios lo compartan.
 *
 * Responsabilidad: solo la configuración de la conexión. No contiene consultas;
 * esas viven en los *.repository.js de cada módulo.
 *
 * La configuración se lee de variables de entorno (.env); los valores por
 * defecto solo sirven para desarrollo local.
 */

import mysql from 'mysql2/promise'

// Un pool reutiliza conexiones en lugar de abrir una nueva por consulta, lo que
// evita agotar las conexiones del servidor cuando hay varias peticiones a la vez.
const pool = mysql.createPool({
  host:     process.env.DB_HOST     || 'localhost',
  port:     process.env.DB_PORT     || 3306,
  user:     process.env.DB_USER     || 'root',
  password: process.env.DB_PASSWORD || '1234',
  database: process.env.DB_NAME     || 'codeatlas',
  waitForConnections: true, // si no hay conexiones libres, espera en cola en vez de fallar
  connectionLimit: 10,      // máximo de conexiones simultáneas en el pool
})

export default pool
