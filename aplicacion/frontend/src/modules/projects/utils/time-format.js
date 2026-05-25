/**
 * time-format.js
 *
 * Utilidades de formateo de fechas para la interfaz, siempre en español.
 * Se usan en las tarjetas de proyectos y diagramas para mostrar cuándo se
 * crearon o actualizaron.
 */

/**
 * Devuelve una descripción relativa y corta de una fecha ("hace 5 min",
 * "hace 2 h"...). Si han pasado más de 7 días, muestra la fecha completa
 * porque a esa distancia el "hace X" deja de ser útil.
 *
 * @param {string} iso - Fecha en formato ISO (la que devuelve la API)
 * @returns {string} Texto relativo o fecha formateada
 */
export function timeAgo(iso) {
  const d = new Date(iso)
  const now = new Date()
  const diff = (now - d) / 1000 // diferencia en segundos
  if (diff < 60) return 'hace un momento'
  if (diff < 3600) return `hace ${Math.floor(diff / 60)} min`
  if (diff < 86400) return `hace ${Math.floor(diff / 3600)} h`
  if (diff < 86400 * 7) return `hace ${Math.floor(diff / 86400)} d`
  return d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })
}

/**
 * Formatea una fecha completa en español (p. ej. "5 may 2026").
 *
 * @param {string} iso - Fecha en formato ISO
 * @returns {string} Fecha formateada
 */
export function fullDate(iso) {
  return new Date(iso).toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}
