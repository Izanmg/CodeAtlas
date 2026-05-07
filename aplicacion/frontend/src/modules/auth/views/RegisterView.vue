<!--
  RegisterView.vue

  Pantalla de registro. Mismo patrón visual que el Login pero con campo de
  nombre añadido. La lógica de creación va contra el mock — cuando llegue
  el backend real, el store será el único punto a tocar.
-->
<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth.store'
import AuthShell from '../components/AuthShell.vue'
import Field from '@/components/ui/Field.vue'
import Input from '@/components/ui/Input.vue'
import Button from '@/components/ui/Button.vue'
import { User, Lock, Loader2 } from 'lucide-vue-next'

const router = useRouter()
const auth = useAuthStore()

const name = ref('')
const email = ref('')
const password = ref('')
const loading = ref(false)

async function submit() {
  loading.value = true
  try {
    await auth.register({
      name: name.value,
      email: email.value,
      password: password.value,
    })
    router.push('/')
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
      Registro
    </div>
    <h1
      class="text-fg font-bold m-0"
      style="font-size: 28px; letter-spacing: -0.02em; line-height: 1.15; margin-bottom: 8px;"
    >
      Crea tu cuenta
    </h1>
    <p
      class="text-fg-muted"
      style="font-size: 13.5px; margin: 0 0 28px;"
    >
      Empieza a documentar la arquitectura de tus proyectos.
    </p>

    <form class="flex flex-col" style="gap: 14px;" @submit.prevent="submit">
      <Field label="Nombre" htmlFor="reg-name">
        <Input
          id="reg-name"
          v-model="name"
          placeholder="Tu nombre"
          autofocus
        >
          <template #icon><User :size="14" /></template>
        </Input>
      </Field>
      <Field label="Email" htmlFor="reg-email">
        <Input
          id="reg-email"
          v-model="email"
          type="email"
          placeholder="tu@email.com"
        >
          <template #icon><User :size="14" /></template>
        </Input>
      </Field>
      <Field label="Contraseña" htmlFor="reg-pw" hint="Mínimo 8 caracteres.">
        <Input
          id="reg-pw"
          v-model="password"
          type="password"
          placeholder="••••••••"
        >
          <template #icon><Lock :size="14" /></template>
        </Input>
      </Field>

      <Button type="submit" variant="primary" size="lg" full-width :disabled="loading">
        <template #icon>
          <Loader2 v-if="loading" :size="14" class="animate-spin-loader" />
        </template>
        {{ loading ? 'Creando…' : 'Crear cuenta' }}
      </Button>

      <div
        class="text-center text-fg-muted"
        style="font-size: 12.5px; margin-top: 4px;"
      >
        ¿Ya tienes cuenta?
        <button
          type="button"
          class="text-accent font-semibold"
          style="font-size: 12.5px; padding: 0; margin-left: 4px;"
          @click="router.push('/login')"
        >
          Iniciar sesión
        </button>
      </div>
    </form>
  </AuthShell>
</template>
