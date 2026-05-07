<!--
  LoginView.vue

  Pantalla de inicio de sesión.
  Acepta cualquier email + contraseña no vacíos como credenciales válidas
  (la validación real vendrá del backend).
-->
<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth.store'
import AuthShell from '../components/AuthShell.vue'
import Field from '@/components/ui/Field.vue'
import Input from '@/components/ui/Input.vue'
import Button from '@/components/ui/Button.vue'
import { User, Lock, AlertCircle, Loader2 } from 'lucide-vue-next'

const router = useRouter()
const auth = useAuthStore()

const email = ref('marcos@codeatlas.dev')
const password = ref('demo-password')
const loading = ref(false)
const error = ref('')

async function submit() {
  if (!email.value || !password.value) {
    error.value = 'Introduce email y contraseña'
    return
  }
  error.value = ''
  loading.value = true
  try {
    await auth.login({ email: email.value, password: password.value })
    router.push('/')
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <AuthShell>
    <div
      class="font-mono text-fg-subtle uppercase font-medium"
      style="font-size: 11px; letter-spacing: 0.06em; margin-bottom: 12px;"
    >
      Acceso
    </div>
    <h1
      class="text-fg font-bold m-0"
      style="font-size: 28px; letter-spacing: -0.02em; line-height: 1.15; margin-bottom: 8px;"
    >
      Bienvenido de vuelta
    </h1>
    <p
      class="text-fg-muted"
      style="font-size: 13.5px; margin: 0 0 28px;"
    >
      Accede para continuar mapeando tu arquitectura.
    </p>

    <form class="flex flex-col" style="gap: 14px;" @submit.prevent="submit">
      <Field label="Email" htmlFor="login-email">
        <Input
          id="login-email"
          v-model="email"
          type="email"
          placeholder="tu@email.com"
          autofocus
        >
          <template #icon><User :size="14" /></template>
        </Input>
      </Field>
      <Field label="Contraseña" htmlFor="login-pw">
        <Input
          id="login-pw"
          v-model="password"
          type="password"
          placeholder="••••••••"
        >
          <template #icon><Lock :size="14" /></template>
        </Input>
      </Field>

      <div
        v-if="error"
        class="bg-danger-bg text-danger flex items-center rounded-md"
        :style="{
          border: '1px solid var(--danger)',
          padding: '8px 12px',
          gap: '8px',
          fontSize: '12.5px',
        }"
      >
        <AlertCircle :size="13" />{{ error }}
      </div>

      <Button type="submit" variant="primary" size="lg" full-width :disabled="loading">
        <template #icon>
          <Loader2 v-if="loading" :size="14" class="animate-spin-loader" />
        </template>
        {{ loading ? 'Entrando…' : 'Entrar' }}
      </Button>

      <div
        class="text-center text-fg-muted"
        style="font-size: 12.5px; margin-top: 4px;"
      >
        ¿Aún no tienes cuenta?
        <button
          type="button"
          class="text-accent font-semibold"
          style="font-size: 12.5px; padding: 0; margin-left: 4px;"
          @click="router.push('/register')"
        >
          Crear cuenta
        </button>
      </div>
    </form>
  </AuthShell>
</template>
