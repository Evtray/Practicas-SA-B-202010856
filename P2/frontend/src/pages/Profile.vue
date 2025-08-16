<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
    <nav class="bg-white dark:bg-slate-900 shadow-sm border-b border-slate-200 dark:border-slate-800">
      <div class="container mx-auto px-4 py-4">
        <div class="flex justify-between items-center">
          <h1 class="text-xl font-semibold">Mi Perfil</h1>
          <router-link to="/dashboard">
            <Button variant="ghost">← Volver al Dashboard</Button>
          </router-link>
        </div>
      </div>
    </nav>

    <div class="container mx-auto px-4 py-8">
      <div class="max-w-2xl mx-auto">
        <Card class="p-6">
          <h2 class="text-2xl font-bold mb-6">Información Personal</h2>
          
          <div class="space-y-4">
            <div>
              <Label>Nombre</Label>
              <p class="mt-1 text-lg">{{ user?.name || 'N/A' }}</p>
            </div>
            
            <div>
              <Label>Correo Electrónico</Label>
              <p class="mt-1 text-lg">{{ user?.email || 'N/A' }}</p>
            </div>
            
            <div>
              <Label>ID de Usuario</Label>
              <p class="mt-1 font-mono text-sm">{{ user?.userId || 'N/A' }}</p>
            </div>
            
            <div>
              <Label>Fecha de Registro</Label>
              <p class="mt-1">{{ formatDate(user?.createdAt) }}</p>
            </div>
          </div>

          <div class="mt-8 pt-6 border-t border-slate-200 dark:border-slate-700">
            <h3 class="text-lg font-semibold mb-4">Configuración de Seguridad</h3>
            
            <div class="space-y-4">
              <div class="flex items-center justify-between">
                <div>
                  <p class="font-medium">Verificación de Email</p>
                  <p class="text-sm text-slate-600 dark:text-slate-400">
                    {{ user?.isEmailVerified ? 'Tu email está verificado' : 'Email pendiente de verificación' }}
                  </p>
                </div>
                <span :class="user?.isEmailVerified ? 'text-green-500' : 'text-yellow-500'">
                  {{ user?.isEmailVerified ? '✓ Verificado' : '⚠ Pendiente' }}
                </span>
              </div>

              <div class="flex items-center justify-between">
                <div>
                  <p class="font-medium">Autenticación de Dos Factores</p>
                  <p class="text-sm text-slate-600 dark:text-slate-400">
                    {{ (user?.has2FA || user?.twoFactorEnabled) ? 'Protección adicional activada' : 'Aumenta la seguridad de tu cuenta' }}
                  </p>
                </div>
                <Button
                  v-if="!(user?.has2FA || user?.twoFactorEnabled)"
                  @click="$router.push('/setup-2fa')"
                  variant="outline"
                  size="sm"
                >
                  Configurar
                </Button>
                <span v-else class="text-green-500">
                  ✓ Activado
                </span>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import Card from '@/components/ui/Card.vue'
import Button from '@/components/ui/Button.vue'
import Label from '@/components/ui/Label.vue'

const authStore = useAuthStore()
const user = computed(() => authStore.user)

const formatDate = (date) => {
  if (!date) return 'N/A'
  return new Date(date).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}
</script>