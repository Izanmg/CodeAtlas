# Frontend

## Stack
- Vue 3 + Vite
- Vue Router — navegación
- Pinia — gestión de estado

## Arrancar
```bash
cd aplicacion/frontend
npm run dev
```
Corre en `http://localhost:5173`.

## Estructura
```
frontend/
└── src/
    ├── modules/
    │   ├── auth/
    │   │   ├── views/
    │   │   └── stores/
    │   ├── dashboard/
    │   │   └── views/
    │   ├── projects/
    │   │   ├── views/
    │   │   └── stores/
    │   └── diagrams/
    │       ├── views/
    │       └── components/
    ├── router/
    │   └── index.js
    ├── App.vue
    └── main.js
```

## Archivos de entrada
- **`main.js`**: crea la app Vue, registra Pinia y Vue Router, monta en `#app`
- **`App.vue`**: componente raíz, renderiza el `<RouterView />`
- **`router/index.js`**: define las rutas de la aplicación

## Módulos

### auth
Vistas y store de autenticación (login, registro, sesión).

### dashboard
Vista principal tras el login.

### projects
Listado y detalle de proyectos del usuario.

### diagrams
Renderiza el modelo JSON como diagrama visual interactivo.

## Dependencias
| Paquete | Uso |
|---------|-----|
| `vue` | Framework de interfaz |
| `vue-router` | Navegación entre vistas |
| `pinia` | Estado global de la app |
| `vite` | Bundler y servidor de desarrollo |
| `@vitejs/plugin-vue` | Soporte de Vue en Vite |
