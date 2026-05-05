# Estructura del frontend

## Base técnica
El frontend se hará con Vue y Vite.

## Objetivo
Construir una interfaz clara, modular y preparada para crecer.

## Pantallas iniciales
- login
- listado de proyectos del usuario
- vista de proyecto
- ajustes de usuario

## Enfoque visual inicial
### 1. Login
Pantalla de acceso para iniciar sesión con usuario y contraseña.

### 2. Listado de proyectos
Tras entrar, el usuario verá sus proyectos en formato de tarjetas.

Cada tarjeta puede mostrar:
- nombre del proyecto
- vista previa del diagrama
- información resumida
- fecha o estado si interesa añadirlo después

### 3. Vista de proyecto
La pantalla del proyecto se dividirá en dos zonas principales:
- zona izquierda: diagrama ocupando la mayor parte de la pantalla
- zona derecha: panel de acciones, controles y operaciones sobre el proyecto

### 4. Ajustes de usuario
Pantalla o sección para modificar datos del usuario.

## Organización sugerida
El frontend también debe separarse por módulos o bloques para que cada parte de la interfaz dependa lo mínimo posible de las demás.
