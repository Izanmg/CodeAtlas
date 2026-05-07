/**
 * main.js
 *
 * Punto de entrada de la aplicación frontend.
 * Crea la instancia de Vue, registra Pinia y Vue Router, importa los estilos
 * globales (tokens + Tailwind + Vue Flow) y monta la app en `#app`.
 */

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'

// Estilos globales de la aplicación (tokens del tema + Tailwind + Vue Flow).
import './styles/main.css'
import '@vue-flow/core/dist/style.css'
import '@vue-flow/core/dist/theme-default.css'
import '@vue-flow/controls/dist/style.css'
import '@vue-flow/minimap/dist/style.css'

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')
