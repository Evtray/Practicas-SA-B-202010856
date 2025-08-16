<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 px-4">
    <Card class="w-full max-w-md p-8">
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-slate-900 dark:text-slate-50">Crear Cuenta</h1>
        <p class="text-slate-600 dark:text-slate-400 mt-2">
          Completa el formulario para registrarte
        </p>
      </div>

      <form @submit.prevent="handleRegister" class="space-y-6">
        <div class="space-y-2">
          <Label htmlFor="name">Nombre Completo</Label>
          <Input
            id="name"
            type="text"
            v-model="form.name"
            placeholder="Juan Pérez"
            required
          />
        </div>

        <div class="space-y-2">
          <Label htmlFor="email">Correo Electrónico</Label>
          <Input
            id="email"
            type="email"
            v-model="form.email"
            placeholder="tu@correo.com"
            required
          />
        </div>

        <div class="space-y-2">
          <Label htmlFor="password">Contraseña</Label>
          <Input
            id="password"
            type="password"
            v-model="form.password"
            placeholder="••••••••"
            required
            minlength="8"
          />
          <p class="text-xs text-slate-500">Mínimo 8 caracteres</p>
        </div>

        <div class="space-y-2">
          <Label htmlFor="confirmPassword">Confirmar Contraseña</Label>
          <Input
            id="confirmPassword"
            type="password"
            v-model="form.confirmPassword"
            placeholder="••••••••"
            required
          />
        </div>

        <Button
          type="submit"
          class="w-full"
          :loading="loading"
          :disabled="loading"
        >
          Registrarse
        </Button>
      </form>

      <div class="mt-6 text-center text-sm">
        <span class="text-slate-600 dark:text-slate-400">¿Ya tienes cuenta?</span>
        <router-link to="/login" class="ml-1 text-blue-600 hover:text-blue-500 font-medium">
          Inicia sesión aquí
        </router-link>
      </div>
    </Card>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'
import { useAuthStore } from '@/stores/auth'
import Card from '@/components/ui/Card.vue'
import Button from '@/components/ui/Button.vue'
import Input from '@/components/ui/Input.vue'
import Label from '@/components/ui/Label.vue'

const router = useRouter()
const toast = useToast()
const authStore = useAuthStore()

const loading = ref(false)
const form = ref({
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
})

const handleRegister = async () => {
  if (form.value.password !== form.value.confirmPassword) {
    toast.error('Las contraseñas no coinciden')
    return
  }

  loading.value = true
  
  try {
    await authStore.register({
      name: form.value.name,
      email: form.value.email,
      password: form.value.password,
    })
    
    toast.success('¡Registro exitoso! Por favor verifica tu correo electrónico.')
    router.push('/login')
  } catch (error) {
    toast.error(error.response?.data?.error || 'Error al registrarse')
  } finally {
    loading.value = false
  }
}
</script>