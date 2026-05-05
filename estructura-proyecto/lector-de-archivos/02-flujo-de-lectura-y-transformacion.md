# Flujo de lectura y transformación a diagrama

## Objetivo
Definir cómo CodeAtlas puede leer archivos de entrada y convertirlos en un diagrama visual.

## Idea principal
No conviene intentar leer cualquier archivo libre y convertirlo directamente a diagrama sin reglas.

Lo más sensato es trabajar en dos niveles:

1. un formato de entrada estructurado y controlado
2. una transformación interna hacia un modelo de datos común que luego se dibuja

## Propuesta general de funcionamiento
El flujo puede ser este:

### 1. Entrada
El usuario sube uno o varios archivos `.md`.

### 2. Lectura
La aplicación lee el contenido de esos archivos.

### 3. Parsing
El sistema interpreta ese contenido siguiendo una estructura definida por CodeAtlas.

### 4. Transformación interna
La información extraída se convierte en un formato interno común.

### 5. Generación visual
Ese formato interno se usa para construir el diagrama dentro de la aplicación.

## Decisión importante
El diagrama no debería generarse directamente desde el texto bruto.

Primero hay que convertir el contenido a una estructura intermedia clara.

Esa estructura interna puede representar cosas como:
- módulos
- pantallas
- componentes
- relaciones
- flujos
- entidades
- acciones

## Enfoque recomendado
### Opción 1. Formato estructurado fijo
Definir una sintaxis concreta en Markdown.

Por ejemplo, bloques o secciones con significado claro:
- proyecto
- módulos
- pantallas
- relaciones
- base de datos
- flujos

### Ventajas
- más fácil de programar
- más estable
- menos errores
- más defendible en el proyecto final

### Inconveniente
- el usuario tiene que seguir una plantilla

## Opción 2. Lectura flexible con ayuda de IA
Permitir que el usuario escriba texto más libre y usar IA para interpretarlo.

La IA no generaría el diagrama directamente. Su papel sería transformar texto menos estructurado en el formato interno de CodeAtlas.

### Ventajas
- más cómodo para el usuario
- más flexible

### Inconvenientes
- más complejidad
- más riesgo de errores
- más difícil de validar
- más difícil de controlar en un TFG/Proyecto de síntesis si se usa como base única

## Recomendación realista
La mejor solución para la primera versión es combinar ambas ideas:

### Base principal
Usar un formato Markdown estructurado definido por CodeAtlas.

### Apoyo opcional de IA
Usar IA como ayuda para:
- validar el contenido
- completar campos
- interpretar texto menos estricto
- transformar descripciones en la estructura interna

Pero la lógica principal de la aplicación debe apoyarse en una estructura clara y controlada.

## Arquitectura de transformación recomendada
### Paso A. Markdown de entrada
Archivo `.md` con una plantilla definida.

### Paso B. Parser propio
Un parser en backend lee el Markdown y extrae bloques.

### Paso C. Modelo interno
El parser genera un objeto estructurado, por ejemplo:
- proyecto
- diagram_type
- nodes
- edges
- metadata

### Paso D. Motor visual
El frontend recibe ese modelo y pinta el diagrama.

## Modelo interno orientativo
Ejemplo conceptual de lo que podría manejar CodeAtlas:

- `project`
- `diagram_type`
- `nodes`
- `connections`
- `groups`
- `metadata`

Cada nodo podría representar una pantalla, un módulo, una entidad o un componente.

Cada conexión podría representar:
- relación
- dependencia
- flujo
- navegación
- uso de datos

## Papel de la IA dentro del sistema
La IA puede encajar en dos momentos:

### 1. Antes del parser
Para convertir una descripción más libre en una estructura más ordenada.

### 2. Después del parser
Para sugerir mejoras, detectar incoherencias o enriquecer el modelo.

## Qué no conviene hacer
- depender solo de IA para toda la lógica
- permitir formato completamente libre sin validación
- mezclar lectura, interpretación y renderizado en una sola fase

## Decisión más sólida por ahora
La aplicación debe tener:
- una plantilla Markdown propia
- un parser propio en backend
- un modelo interno común para cualquier diagrama
- soporte opcional de IA como ayuda, no como única base

## Siguiente paso lógico
Definir el formato exacto del archivo Markdown que usará el tipo `doc-diagram`.
