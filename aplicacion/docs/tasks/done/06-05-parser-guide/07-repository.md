# 07 — parser.repository.js

## Qué hace
Gestiona la persistencia del modelo JSON generado. Por ahora, dado que la base de datos aún no está configurada, implementa las funciones con almacenamiento en memoria como placeholder. Cuando se configure la BD, solo habrá que cambiar este archivo.

## Funciones

```js
// Guarda el modelo JSON
export async function saveModel(model) {}

// Recupera el modelo guardado
export async function getModel() {}
```

## Implementación temporal (en memoria)

```js
let storedModel = null

export async function saveModel(model) {
  storedModel = model
}

export async function getModel() {
  return storedModel
}
```

> Cuando se integre la base de datos, `saveModel` hará un INSERT o UPDATE en la tabla correspondiente y `getModel` hará un SELECT. La interfaz de las funciones no cambia, por lo que el service no tendrá que modificarse.
