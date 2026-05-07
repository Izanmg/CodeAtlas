/**
 * parser.repository.js
 *
 * Persiste y recupera el diagrama generado por el parser.
 *
 * La base de datos todavía no está configurada, así que esta es una
 * implementación temporal en memoria. Las firmas de las funciones están
 * pensadas para coincidir con lo que necesitará la implementación real
 * con BD, de forma que cuando se conecte la base de datos solo cambie
 * este archivo — el service no necesita tocarse.
 *
 * El diagrama guardado tiene la forma { model, layout } donde:
 *   - model: el modelo JSON unificado generado por el parser
 *   - layout: las coordenadas por defecto de cada nodo (calculadas por layout-calculator)
 */

let storedDiagram = null

/**
 * Guarda el diagrama (modelo + layout).
 *
 * @param {{ model: object, layout: object }} diagram
 * @returns {Promise<void>}
 */
export async function saveModel(diagram) {
  storedDiagram = diagram
}

/**
 * Recupera el diagrama guardado, o null si todavía no se ha guardado nada.
 *
 * @returns {Promise<{ model: object, layout: object }|null>}
 */
export async function getModel() {
  return storedDiagram
}
