/**
 * parser.repository.js
 *
 * Persists and retrieves the unified JSON model.
 *
 * The database is not configured yet, so this is a temporary in-memory
 * implementation. The function signatures are designed to match what a
 * real DB implementation will need, so once the DB is wired up only this
 * file changes — the service does not need to be touched.
 */

let storedModel = null

/**
 * Saves the unified JSON model.
 *
 * @param {object} model - The unified JSON model to persist
 * @returns {Promise<void>}
 */
export async function saveModel(model) {
  storedModel = model
}

/**
 * Retrieves the saved model, or null if nothing has been saved yet.
 *
 * @returns {Promise<object|null>}
 */
export async function getModel() {
  return storedModel
}
