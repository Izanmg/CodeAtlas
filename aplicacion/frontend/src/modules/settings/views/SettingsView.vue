<!--
  SettingsView.vue

  Pantalla de configuración con tres pestañas verticales:
  Perfil · Contraseña · Preferencias.
-->
<script setup>
import { ref } from 'vue'
import { useSettingsStore } from '../stores/settings.store'
import { useAuthStore } from '@/modules/auth/stores/auth.store'

import AppShell from '@/components/layout/AppShell.vue'
import PageHeader from '@/components/ui/PageHeader.vue'
import Card from '@/components/ui/Card.vue'
import Field from '@/components/ui/Field.vue'
import Input from '@/components/ui/Input.vue'
import Button from '@/components/ui/Button.vue'
import Segmented from '@/components/ui/Segmented.vue'
import { User, Lock, Settings as SettingsIcon, Sun, Moon, Check } from 'lucide-vue-next'

const settingsStore = useSettingsStore()
const authStore = useAuthStore()

const activeTab = ref('profile')
const tabs = [
  { id: 'profile', label: 'Perfil', icon: User },
  { id: 'password', label: 'Contraseña', icon: Lock },
  { id: 'preferences', label: 'Preferencias', icon: SettingsIcon },
]

const name = ref(authStore.user?.name || '')
const email = ref(authStore.user?.email || '')
const saved = ref(false)

async function saveProfile() {
  await authStore.updateUser({ name: name.value, email: email.value })
  saved.value = true
  setTimeout(() => (saved.value = false), 2000)
}

const currentPw = ref('')
const newPw = ref('')
const confirmPw = ref('')
const pwSaved = ref(false)
const pwError = ref('')

async function savePassword() {
  pwError.value = ''
  try {
    await authStore.changePassword({
      currentPassword: currentPw.value,
      newPassword: newPw.value,
      confirmPassword: confirmPw.value,
    })
    pwSaved.value = true
    currentPw.value = ''
    newPw.value = ''
    confirmPw.value = ''
    setTimeout(() => (pwSaved.value = false), 2000)
  } catch (e) {
    pwError.value = e.message
  }
}
</script>

<template>
  <AppShell>
    <div class="px-4 sm:px-8 pt-6 sm:pt-8 pb-16" style="max-width: 1040px; margin: 0 auto;">
      <PageHeader
        eyebrow="cuenta"
        title="Configuración"
        description="Ajusta tu perfil, contraseña y preferencias de la herramienta."
      />

      <div class="flex flex-col md:grid" :style="{ gridTemplateColumns: '180px 1fr', gap: '28px' }">
        <nav class="flex flex-row md:flex-col overflow-x-auto" style="gap: 1px;">
          <button
            v-for="t in tabs"
            :key="t.id"
            class="flex items-center text-left rounded-sm transition-colors duration-100 flex-shrink-0"
            :style="{
              padding: '7px 10px',
              gap: '9px',
              background: activeTab === t.id ? 'var(--bg-muted)' : 'transparent',
              color: activeTab === t.id ? 'var(--fg)' : 'var(--fg-muted)',
              fontSize: '13px',
              fontWeight: activeTab === t.id ? 600 : 500,
              border: '1px solid transparent',
            }"
            @click="activeTab = t.id"
          >
            <component
              :is="t.icon"
              :size="13"
              :style="{ color: activeTab === t.id ? 'var(--accent)' : 'var(--fg-faint)' }"
            />
            {{ t.label }}
          </button>
        </nav>

        <div>
          <!-- Perfil -->
          <Card v-if="activeTab === 'profile'" :padding="20" style="margin-bottom: 14px;">
            <h2
              class="text-fg font-semibold m-0"
              :style="{ fontSize: '16px', letterSpacing: '-0.015em', marginBottom: '4px' }"
            >Perfil</h2>
            <p class="text-fg-muted" :style="{ margin: '0 0 18px', fontSize: '13px' }">
              Información que se muestra en tu cuenta.
            </p>

            <div
              class="flex items-center"
              :style="{
                gap: '16px',
                marginBottom: '20px',
                paddingBottom: '20px',
                borderBottom: '1px solid var(--border-subtle)',
              }"
            >
              <div
                class="grid place-items-center bg-accent text-accent-fg font-semibold rounded-full"
                :style="{
                  width: '56px',
                  height: '56px',
                  fontSize: '18px',
                  letterSpacing: '0.01em',
                }"
              >{{ authStore.user?.initials }}</div>
              <div>
                <Button variant="secondary" size="sm">Cambiar foto</Button>
                <div class="text-fg-subtle" :style="{ fontSize: '11.5px', marginTop: '5px' }">
                  JPG o PNG · máx. 2 MB
                </div>
              </div>
            </div>

            <div class="flex flex-col" :style="{ gap: '12px', maxWidth: '420px' }">
              <Field label="Nombre" htmlFor="prof-name">
                <Input id="prof-name" v-model="name" />
              </Field>
              <Field label="Email" htmlFor="prof-email">
                <Input id="prof-email" v-model="email" type="email" />
              </Field>
            </div>

            <div class="flex items-center" :style="{ marginTop: '20px', gap: '8px' }">
              <Button variant="primary" @click="saveProfile">Guardar cambios</Button>
              <span
                v-if="saved"
                class="text-success inline-flex items-center"
                :style="{ fontSize: '12.5px', gap: '4px' }"
              >
                <Check :size="13" /> Guardado
              </span>
            </div>
          </Card>

          <!-- Contraseña -->
          <Card v-if="activeTab === 'password'" :padding="20" style="margin-bottom: 14px;">
            <h2
              class="text-fg font-semibold m-0"
              :style="{ fontSize: '16px', letterSpacing: '-0.015em', marginBottom: '4px' }"
            >Cambiar contraseña</h2>
            <p class="text-fg-muted" :style="{ margin: '0 0 18px', fontSize: '13px' }">
              Introduce tu contraseña actual y la nueva.
            </p>

            <div class="flex flex-col" :style="{ gap: '12px', maxWidth: '420px' }">
              <Field label="Contraseña actual" htmlFor="pw-cur">
                <Input id="pw-cur" v-model="currentPw" type="password">
                  <template #icon><Lock :size="14" /></template>
                </Input>
              </Field>
              <Field label="Nueva contraseña" htmlFor="pw-new" hint="Mínimo 8 caracteres.">
                <Input id="pw-new" v-model="newPw" type="password">
                  <template #icon><Lock :size="14" /></template>
                </Input>
              </Field>
              <Field label="Confirmar nueva contraseña" htmlFor="pw-conf">
                <Input id="pw-conf" v-model="confirmPw" type="password">
                  <template #icon><Lock :size="14" /></template>
                </Input>
              </Field>
            </div>

            <div class="flex items-center" :style="{ marginTop: '20px', gap: '8px' }">
              <Button
                variant="primary"
                :disabled="!currentPw || !newPw || newPw !== confirmPw"
                @click="savePassword"
              >Actualizar contraseña</Button>
              <span
                v-if="pwSaved"
                class="text-success inline-flex items-center"
                :style="{ fontSize: '12.5px', gap: '4px' }"
              >
                <Check :size="13" /> Guardado
              </span>
              <span
                v-if="pwError"
                class="text-danger"
                :style="{ fontSize: '12.5px' }"
              >{{ pwError }}</span>
            </div>
          </Card>

          <!-- Preferencias -->
          <Card v-if="activeTab === 'preferences'" :padding="20" style="margin-bottom: 14px;">
            <h2
              class="text-fg font-semibold m-0"
              :style="{ fontSize: '16px', letterSpacing: '-0.015em', marginBottom: '4px' }"
            >Preferencias</h2>
            <p class="text-fg-muted" :style="{ margin: '0 0 18px', fontSize: '13px' }">
              Apariencia e idioma de la aplicación.
            </p>

            <div
              class="flex justify-between items-center"
              :style="{
                padding: '14px 0',
                borderBottom: '1px solid var(--border-subtle)',
                gap: '16px',
              }"
            >
              <div class="min-w-0">
                <div class="text-fg font-semibold" style="font-size: 13px;">Tema</div>
                <div class="text-fg-subtle" :style="{ fontSize: '12px', marginTop: '2px' }">
                  Claro u oscuro. Puedes cambiarlo también desde la barra superior.
                </div>
              </div>
              <Segmented
                :model-value="settingsStore.theme"
                :options="[
                  { value: 'light', label: 'Claro', icon: Sun },
                  { value: 'dark', label: 'Oscuro', icon: Moon },
                ]"
                @update:model-value="settingsStore.setTheme"
              />
            </div>
          </Card>
        </div>
      </div>
    </div>
  </AppShell>
</template>
