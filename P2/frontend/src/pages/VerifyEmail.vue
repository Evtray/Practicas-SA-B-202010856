<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 px-4">
    <Card class="w-full max-w-md p-8 text-center">
      <div v-if="loading">
        <div class="flex justify-center mb-4">
          <svg class="animate-spin h-12 w-12 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
        <h2 class="text-xl font-semibold">Verificando tu correo electrónico...</h2>
      </div>

      <div v-else-if="success">
        <div class="flex justify-center mb-4">
          <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <span class="text-3xl text-green-500">✓</span>
          </div>
        </div>
        <h2 class="text-2xl font-bold mb-2">¡Email Verificado!</h2>
        <p class="text-slate-600 dark:text-slate-400 mb-6">
          Tu correo electrónico ha sido verificado exitosamente.
        </p>
        <Button @click="$router.push('/login')" class="w-full">
          Ir a Iniciar Sesión
        </Button>
      </div>

      <div v-else>
        <div class="flex justify-center mb-4">
          <div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
            <span class="text-3xl text-red-500">✗</span>
          </div>
        </div>
        <h2 class="text-2xl font-bold mb-2">Error de Verificación</h2>
        <p class="text-slate-600 dark:text-slate-400 mb-6">
          {{ error || 'El enlace de verificación es inválido o ha expirado.' }}
        </p>
        <Button @click="$router.push('/login')" variant="outline" class="w-full">
          Volver al Inicio de Sesión
        </Button>
      </div>
    </Card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import Card from '@/components/ui/Card.vue'
import Button from '@/components/ui/Button.vue'

const route = useRoute()
const authStore = useAuthStore()

const loading = ref(true)
const success = ref(false)
const error = ref('')

onMounted(async () => {
  const token = route.query.token

  if (!token) {
    loading.value = false
    error.value = 'Token de verificación no proporcionado'
    return
  }

  try {
    await authStore.verifyEmail(token)
    success.value = true
  } catch (err) {
    error.value = err.response?.data?.error || 'Error al verificar el email'
  } finally {
    loading.value = false
  }
})
</script>