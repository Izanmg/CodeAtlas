/**
 * router/index.js
 *
 * Configuración central de Vue Router para toda la aplicación.
 * Cada módulo tiene aquí sus rutas registradas con `meta.requiresAuth`.
 *
 * Un guard global redirige a /login cuando el usuario intenta acceder a
 * una ruta protegida sin sesión, y a / cuando un usuario autenticado
 * intenta entrar a /login o /register.
 */

import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/modules/auth/stores/auth.store'

const routes = [
  // Auth
  {
    path: '/login',
    name: 'login',
    component: () => import('@/modules/auth/views/LoginView.vue'),
    meta: { requiresAuth: false, guestOnly: true },
  },
  {
    path: '/register',
    name: 'register',
    component: () => import('@/modules/auth/views/RegisterView.vue'),
    meta: { requiresAuth: false, guestOnly: true },
  },

  // Dashboard
  {
    path: '/',
    name: 'dashboard',
    component: () => import('@/modules/dashboard/views/DashboardView.vue'),
    meta: { requiresAuth: true },
  },

  // Proyectos
  {
    path: '/projects/:id',
    name: 'project-detail',
    component: () => import('@/modules/projects/views/ProjectDetailView.vue'),
    meta: { requiresAuth: true },
  },

  // Diagramas
  {
    path: '/projects/:id/diagrams/new',
    name: 'diagram-new',
    component: () => import('@/modules/diagrams/views/DiagramNewView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/diagrams/:id',
    name: 'diagram-view',
    component: () => import('@/modules/diagrams/views/DiagramView.vue'),
    meta: { requiresAuth: true },
  },

  // Configuración
  {
    path: '/settings',
    name: 'settings',
    component: () => import('@/modules/settings/views/SettingsView.vue'),
    meta: { requiresAuth: true },
  },

  // Cualquier ruta no encontrada vuelve al dashboard.
  { path: '/:pathMatch(.*)*', redirect: '/' },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

// Guard: protege las rutas con `requiresAuth` y bloquea las `guestOnly`
// cuando ya hay sesión.
router.beforeEach((to) => {
  const auth = useAuthStore()
  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    return { name: 'login' }
  }
  if (to.meta.guestOnly && auth.isAuthenticated) {
    return { name: 'dashboard' }
  }
})

export default router
