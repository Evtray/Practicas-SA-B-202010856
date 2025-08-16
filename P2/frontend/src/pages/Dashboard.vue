<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
    <nav class="bg-white dark:bg-slate-900 shadow-sm border-b border-slate-200 dark:border-slate-800">
      <div class="container mx-auto px-4 py-4">
        <div class="flex justify-between items-center">
          <h1 class="text-xl font-semibold">Dashboard</h1>
          <div class="flex items-center gap-4">
            <router-link to="/profile">
              <Button variant="ghost">Perfil</Button>
            </router-link>
            <Button variant="outline" @click="handleLogout">
              Cerrar Sesión
            </Button>
          </div>
        </div>
      </div>
    </nav>

    <div class="container mx-auto px-4 py-8">
      <div class="max-w-4xl mx-auto">
        <Card class="p-6 mb-6">
          <h2 class="text-2xl font-bold mb-4">
            Bienvenido, {{ user?.name || 'Usuario' }}
          </h2>
          <p class="text-slate-600 dark:text-slate-400">
            Has iniciado sesión exitosamente en el sistema.
          </p>
        </Card>

        <div class="grid md:grid-cols-2 gap-6">
          <Card class="p-6">
            <h3 class="text-lg font-semibold mb-3">Estado de la Cuenta</h3>
            <div class="space-y-2">
              <div class="flex justify-between">
                <span>Email Verificado:</span>
                <span :class="user?.isEmailVerified ? 'text-green-500' : 'text-yellow-500'">
                  {{ user?.isEmailVerified ? '✓ Sí' : '⚠ No' }}
                </span>
              </div>
              <div class="flex justify-between">
                <span>2FA Activado:</span>
                <span :class="user?.has2FA ? 'text-green-500' : 'text-slate-400'">
                  {{ user?.has2FA ? '✓ Sí' : 'No' }}
                </span>
              </div>
            </div>
            
            <div class="mt-4">
              <Button 
                v-if="!user?.has2FA"
                @click="$router.push('/setup-2fa')"
                variant="outline"
                size="sm"
                class="w-full"
              >
                Configurar 2FA
              </Button>
            </div>
          </Card>

          <Card class="p-6">
            <h3 class="text-lg font-semibold mb-3">Información de Sesión</h3>
            <div class="space-y-2 text-sm">
              <div class="flex justify-between">
                <span>Última conexión:</span>
                <span>{{ formatDate(user?.lastLogin) }}</span>
              </div>
              <div class="flex justify-between">
                <span>Sesión activa desde:</span>
                <span>{{ sessionDuration }}</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'
import { useAuthStore } from '@/stores/auth'
import Card from '@/components/ui/Card.vue'
import Button from '@/components/ui/Button.vue'

const router = useRouter()
const toast = useToast()
const authStore = useAuthStore()

const user = computed(() => authStore.user)
const sessionStart = ref(new Date())

const sessionDuration = computed(() => {
  const now = new Date()
  const diff = Math.floor((now - sessionStart.value) / 1000)
  const minutes = Math.floor(diff / 60)
  const seconds = diff % 60
  return `${minutes}m ${seconds}s`
})

const formatDate = (date) => {
  if (!date) return 'N/A'
  return new Date(date).toLocaleString()
}

const handleLogout = async () => {
  await authStore.logout()
  toast.success('Sesión cerrada correctamente')
  router.push('/login')
}

onMounted(() => {
  // Update session duration every second
  setInterval(() => {
    sessionStart.value = new Date(sessionStart.value)
  }, 1000)
})
</script>