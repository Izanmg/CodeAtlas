<!--
  AppTopbar.vue

  Cabecera global de la aplicación para todas las rutas autenticadas.
  Contiene:
    - Logo + breadcrumbs (cada miga es navegable si tiene `to`)
    - Botón de búsqueda (placeholder, abre la paleta de comandos)
    - Toggle de tema claro/oscuro
    - Botón de configuración
    - Avatar con menú desplegable (perfil, cerrar sesión)

  El topbar NO se renderiza en `/login`, `/register` ni en `/diagrams/:id`
  porque esas vistas tienen su propio chrome — la decisión vive en App.vue.
-->
<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useSettingsStore } from '@/modules/settings/stores/settings.store'
import { useAuthStore } from '@/modules/auth/stores/auth.store'
import { ChevronRight, ChevronLeft, Search, Sun, Moon, Settings, User, LogOut } from 'lucide-vue-next'

defineProps({
  breadcrumbs: { type: Array, default: () => [] }, // [{ label, to? }]
})

const router = useRouter()
const settingsStore = useSettingsStore()
const authStore = useAuthStore()

const menuOpen = ref(false)
const menuRef = ref(null)
const user = computed(() => authStore.user)

function closeOnClickOutside(event) {
  if (!menuRef.value) return
  if (!menuRef.value.contains(event.target)) menuOpen.value = false
}

onMounted(() => document.addEventListener('mousedown', closeOnClickOutside))
onUnmounted(() => document.removeEventListener('mousedown', closeOnClickOutside))

function goHome() {
  router.push('/')
}

function goSettings() {
  router.push('/settings')
}

function logout() {
  authStore.logout()
  router.push('/login')
}
</script>

<template>
  <header
    class="bg-surface flex items-center sticky top-0 z-30 flex-shrink-0"
    :style="{
      height: '48px',
      borderBottom: '1px solid var(--border)',
      padding: '0 16px',
      gap: '12px',
    }"
  >
    <button
      class="inline-flex items-center"
      style="padding: 0; gap: 9px;"
      @click="goHome"
    >
      <img src="/logo.svg" alt="CodeAtlas" :style="{ width: '24px', height: '24px' }" />
      <span
        class="font-semibold text-fg"
        style="font-size: 15px; letter-spacing: -0.02em;"
      >CodeAtlas</span>
    </button>

    <template v-if="breadcrumbs.length > 0">
      <div :style="{ width: '1px', height: '18px', background: 'var(--border)', flexShrink: 0 }" />

      <!-- Breadcrumbs completos — tablet+ -->
      <nav
        class="hidden sm:flex items-center min-w-0 flex-1"
        style="gap: 6px; font-size: 13px;"
      >
        <template v-for="(bc, i) in breadcrumbs" :key="i">
          <ChevronRight
            v-if="i > 0"
            :size="12"
            class="text-fg-faint flex-shrink-0"
          />
          <button
            v-if="bc.to"
            class="text-fg-muted hover:bg-bg-muted hover:text-fg whitespace-nowrap font-medium rounded transition-colors duration-100"
            style="padding: 3px 6px; font-size: 13px;"
            @click="router.push(bc.to)"
          >
            {{ bc.label }}
          </button>
          <span
            v-else
            class="text-fg whitespace-nowrap overflow-hidden text-ellipsis font-medium"
            style="padding: 3px 6px;"
          >{{ bc.label }}</span>
        </template>
      </nav>

      <!-- Breadcrumb móvil: flecha atrás + página actual -->
      <nav class="flex sm:hidden items-center min-w-0 flex-1" style="gap: 2px; font-size: 13px;">
        <button
          v-if="breadcrumbs.find(b => b.to)"
          class="text-fg-muted hover:text-fg grid place-items-center flex-shrink-0 rounded transition-colors duration-100"
          style="width: 28px; height: 28px;"
          @click="router.push(breadcrumbs.find(b => b.to).to)"
        >
          <ChevronLeft :size="15" />
        </button>
        <span
          class="text-fg font-medium overflow-hidden text-ellipsis whitespace-nowrap"
          style="font-size: 13px; padding: 3px 4px;"
        >{{ breadcrumbs[breadcrumbs.length - 1]?.label }}</span>
      </nav>
    </template>

    <div class="ml-auto flex items-center" style="gap: 8px;">
      <!-- Buscador completo — solo en pantallas medianas+ -->
      <button
        class="focus-ring hidden md:inline-flex items-center bg-bg-subtle text-fg-subtle rounded-md transition-colors duration-100"
        :style="{
          padding: '0 8px 0 10px',
          height: '30px',
          border: '1px solid var(--border)',
          fontSize: '12.5px',
          minWidth: '220px',
          gap: '8px',
        }"
      >
        <Search :size="13" />
        <span class="flex-1 text-left">Buscar bloques, diagramas…</span>
        <kbd>⌘K</kbd>
      </button>
      <!-- Icono de búsqueda — solo en móvil -->
      <button
        class="focus-ring md:hidden grid place-items-center rounded-md text-fg-muted hover:bg-bg-muted hover:text-fg transition-colors duration-100"
        :style="{ width: '30px', height: '30px', border: '1px solid var(--border)' }"
        title="Buscar"
      >
        <Search :size="15" />
      </button>

      <button
        class="focus-ring grid place-items-center rounded-md text-fg-muted hover:bg-bg-muted hover:text-fg transition-colors duration-100"
        :style="{ width: '30px', height: '30px' }"
        title="Cambiar tema"
        @click="settingsStore.toggleTheme()"
      >
        <Sun v-if="settingsStore.theme === 'dark'" :size="15" />
        <Moon v-else :size="15" />
      </button>

      <button
        class="focus-ring hidden sm:grid place-items-center rounded-md text-fg-muted hover:bg-bg-muted hover:text-fg transition-colors duration-100"
        :style="{ width: '30px', height: '30px' }"
        title="Configuración"
        @click="goSettings"
      >
        <Settings :size="15" />
      </button>

      <div ref="menuRef" class="relative">
        <button
          class="focus-ring rounded-full bg-accent text-accent-fg font-semibold grid place-items-center"
          :style="{ width: '28px', height: '28px', fontSize: '11px' }"
          @click="menuOpen = !menuOpen"
        >
          {{ user?.initials || '?' }}
        </button>
        <div
          v-if="menuOpen"
          class="absolute bg-surface-overlay rounded-md shadow-lg z-[50]"
          :style="{
            top: '36px',
            right: 0,
            minWidth: '220px',
            border: '1px solid var(--border)',
            padding: '4px',
          }"
        >
          <div
            :style="{
              padding: '8px 10px 10px',
              borderBottom: '1px solid var(--border-subtle)',
              marginBottom: '4px',
            }"
          >
            <div class="text-fg font-medium" style="font-size: 12.5px;">
              {{ user?.name }}
            </div>
            <div class="text-fg-subtle" style="font-size: 11.5px;">
              {{ user?.email }}
            </div>
          </div>
          <button
            class="w-full flex items-center text-fg hover:bg-bg-muted rounded text-left"
            style="padding: 6px 10px; font-size: 12.5px; gap: 8px;"
            @click="menuOpen = false; goSettings()"
          >
            <User :size="13" class="text-fg-faint" />
            <span class="flex-1">Mi cuenta</span>
          </button>
          <button
            class="w-full flex items-center text-danger hover:bg-bg-muted rounded text-left"
            style="padding: 6px 10px; font-size: 12.5px; gap: 8px;"
            @click="menuOpen = false; logout()"
          >
            <LogOut :size="13" class="text-danger" />
            <span class="flex-1">Cerrar sesión</span>
          </button>
        </div>
      </div>
    </div>
  </header>
</template>
