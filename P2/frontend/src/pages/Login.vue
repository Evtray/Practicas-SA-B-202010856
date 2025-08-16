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
            v-model="twoFactorCode"
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

      <div class="mt-4 relative">
        <div class="absolute inset-0 flex items-center">
          <div class="w-full border-t border-slate-200 dark:border-slate-700"></div>
        </div>
        <div class="relative flex justify-center text-sm">
          <span class="px-2 bg-white dark:bg-slate-800 text-slate-500">O continúa con</span>
        </div>
      </div>

      <Button
        @click="loginWithGoogle"
        variant="outline"
        class="w-full mt-4 flex items-center justify-center gap-2"
      >
        <svg class="w-5 h-5" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
        Iniciar sesión con Google
      </Button>
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
})
const twoFactorCode = ref('')

const handleLogin = async () => {
  loading.value = true
  
  try {
    if (requires2FA.value && twoFactorCode.value) {
      const response = await authStore.verify2FALogin(twoFactorCode.value)
      toast.success('¡Inicio de sesión exitoso!')
      router.push('/dashboard')
    } else {
      const response = await authStore.login(form.value)
      
      if (response.requiresTwoFactor) {
        requires2FA.value = true
        toast.info('Por favor ingresa tu código 2FA')
        loading.value = false
        return
      }
      
      toast.success('¡Inicio de sesión exitoso!')
      router.push('/dashboard')
    }
  } catch (error) {
    toast.error(error.response?.data?.error || 'Error al iniciar sesión')
  } finally {
    loading.value = false
  }
}

const loginWithGoogle = () => {
  window.location.href = `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/auth/google`
}
</script>