<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 px-4">
    <Card class="w-full max-w-md p-8">
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-slate-900 dark:text-slate-50">Iniciar Sesión</h1>
        <p class="text-slate-600 dark:text-slate-400 mt-2">
          Ingresa tus credenciales para acceder
        </p>
      </div>

      <form @submit.prevent="handleLogin" class="space-y-6">
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
          />
        </div>

        <div v-if="requires2FA" class="space-y-2">
          <Label htmlFor="twoFactorCode">Código 2FA</Label>
          <Input
            id="twoFactorCode"
            type="text"
            v-model="form.twoFactorCode"
            placeholder="123456"
            maxlength="6"
            required
          />
        </div>

        <Button
          type="submit"
          class="w-full"
          :loading="loading"
          :disabled="loading"
        >
          Iniciar Sesión
        </Button>
      </form>

      <div class="mt-6 text-center text-sm">
        <span class="text-slate-600 dark:text-slate-400">¿No tienes cuenta?</span>
        <router-link to="/register" class="ml-1 text-blue-600 hover:text-blue-500 font-medium">
          Regístrate aquí
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
const requires2FA = ref(false)
const form = ref({
  email: '',
  password: '',
  twoFactorCode: '',
})

const handleLogin = async () => {
  loading.value = true
  
  try {
    const response = await authStore.login(form.value)
    
    if (response.requires2FA) {
      requires2FA.value = true
      toast.info('Por favor ingresa tu código 2FA')
      return
    }
    
    toast.success('¡Inicio de sesión exitoso!')
    router.push('/dashboard')
  } catch (error) {
    toast.error(error.response?.data?.error || 'Error al iniciar sesión')
  } finally {
    loading.value = false
  }
}
</script>