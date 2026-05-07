# 03 — core/yaml-parser.js

## Qué hace
Recibe un string YAML y lo convierte en un objeto JS. Es un wrapper fino sobre `js-yaml` con manejo de errores. No valida el contenido — solo convierte el formato.

## Responsabilidad única
Este archivo hace una sola cosa: YAML → objeto JS. No filtra campos, no convierte a camelCase, no comprueba tipos. Si el YAML es sintácticamente válido, devuelve el objeto. La validación del contenido es responsabilidad de `validator.js`.

---

## Firma

```js
// Recibe: string YAML
// Devuelve: objeto JS, o null si el string está vacío
// Lanza: Error con mensaje descriptivo si el YAML tiene errores de sintaxis
export function parseYaml(yamlString) {}
```

---

## Estructura mínima del archivo

```js
import yaml from 'js-yaml'

export function parseYaml(yamlString) {
  if (!yamlString || !yamlString.trim()) return null

  try {
    return yaml.load(yamlString)
  } catch (error) {
    throw new Error(formatYamlError(error, yamlString))
  }
}

function formatYamlError(error, yamlString) {
  // construye un mensaje de error legible con contexto del string problemático
}
```

---

## Lógica de `formatYamlError`

`js-yaml` lanza errores de tipo `YAMLException` que incluyen `error.mark` con la línea y columna exactas del problema. Usa esa información para mostrar el fragmento YAML completo con una flecha apuntando a la línea del error:

```js
function formatYamlError(error, yamlString) {
  if (!error.mark) {
    return `YAML syntax error: ${error.message}`
  }

  const errorLine = error.mark.line      // índice base 0
  const errorCol = error.mark.column    // índice base 0
  const lines = yamlString.split('\n')

  // construye el fragmento con número de línea por cada línea
  const frame = lines.map((line, i) => {
    const lineNumber = String(i + 1).padStart(3, ' ')
    const marker = i === errorLine ? ` ← ${error.reason}` : ''
    return `${lineNumber} | ${line}${marker}`
  }).join('\n')

  return `YAML syntax error at line ${errorLine + 1}, column ${errorCol + 1}:\n\n${frame}`
}
```
```

El preview de 120 caracteres con los saltos de línea visibles (`↵`) ayuda a localizar el error sin necesidad de abrir el archivo.

---

## Prácticas a seguir

**No uses `yaml.safeLoad`** — está deprecado desde js-yaml v4. Usa siempre `yaml.load`.

**No captures el error en silencio.** Si el YAML tiene un error de sintaxis es un problema del archivo del usuario, no del sistema. Debe lanzar, no devolver `null`. El `null` está reservado únicamente para strings vacíos.

**No transformes el resultado.** Los campos con guión (`requires-auth`, `depends-on`) se mantienen tal cual en el objeto JS. El model-builder los convierte a camelCase cuando construye el modelo. Si se transforma aquí, el validator y el model-builder tendrán que conocer dos formatos distintos.

---

## Resultado esperado

Entrada:
```yaml
type: screen
id: login
name: Login
requires-auth: false
navigates-to: [dashboard, register]
routes:
  - /auth/login
  - /login
```

Salida:
```js
{
  type: 'screen',
  id: 'login',
  name: 'Login',
  'requires-auth': false,
  'navigates-to': ['dashboard', 'register'],
  routes: ['/auth/login', '/login']
}
```

Los campos con guión se mantienen con guión. La conversión a camelCase la hace `model-builder.js`.

---

## Ejemplo de error

Entrada con YAML malformado:
```yaml
type: screen
id: login
  name: Login
description: Entry point
requires-auth: false
```

Error que se lanza:
```
YAML syntax error at line 3, column 3:

  1 | type: screen
  2 | id: login
  3 |   name: Login ← bad indentation of a mapping entry
  4 | description: Entry point
  5 | requires-auth: false
```

El fragmento muestra el YAML completo con numeración de líneas y la flecha en la línea exacta del problema.
