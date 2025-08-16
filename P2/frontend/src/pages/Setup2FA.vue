<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
    <nav class="bg-white dark:bg-slate-900 shadow-sm border-b border-slate-200 dark:border-slate-800">
      <div class="container mx-auto px-4 py-4">
        <div class="flex justify-between items-center">
          <h1 class="text-xl font-semibold">Configurar 2FA</h1>
          <router-link to="/dashboard">
            <Button variant="ghost">← Volver al Dashboard</Button>
          </router-link>
        </div>
      </div>
    </nav>

    <div class="container mx-auto px-4 py-8">
      <div class="max-w-2xl mx-auto">
        <Card class="p-6">
          <h2 class="text-2xl font-bold mb-6">Autenticación de Dos Factores</h2>
          
          <div v-if="!qrCodeUrl" class="text-center py-8">
            <p class="mb-4 text-slate-600 dark:text-slate-400">
              La autenticación de dos factores añade una capa extra de seguridad a tu cuenta.
            </p>
            <Button @click="setup2FA" :loading="loading">
              Generar Código QR
            </Button>
          </div>

          <div v-else class="space-y-6">
            <div class="text-center">
              <p class="mb-4 text-sm text-slate-600 dark:text-slate-400">
                Escanea este código QR con tu aplicación de autenticación
                (Google Authenticator, Authy, etc.)
              </p>
              <div class="inline-block p-4 bg-white rounded-lg">
                <img :src="qrCodeUrl" alt="QR Code" class="w-48 h-48" />
              </div>
            </div>

            <div>
              <Label>Código Manual</Label>
              <div class="flex items-center gap-2 mt-2">
                <code class="flex-1 p-2 bg-slate-100 dark:bg-slate-800 rounded font-mono text-sm">
                  {{ secret }}
                </code>
                <Button @click="copySecret" variant="outline" size="sm">
                  Copiar
                </Button>
              </div>
            </div>

            <div>
              <Label htmlFor="verificationCode">Código de Verificación</Label>
              <div class="flex gap-2 mt-2">
                <Input
                  id="verificationCode"
                  v-model="verificationCode"
                  placeholder="123456"
                  maxlength="6"
                  class="flex-1"
                />
                <Button @click="verify2FA" :loading="verifying">
                  Verificar y Activar
                </Button>
              </div>
              <p class="text-xs text-slate-500 mt-2">
                Ingresa el código de 6 dígitos de tu aplicación
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
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
const verifying = ref(false)
const qrCodeUrl = ref('')
const secret = ref('')
const verificationCode = ref('')

const setup2FA = async () => {
  loading.value = true
  try {
    const response = await authStore.setup2FA()
    qrCodeUrl.value = response.qrCode
    secret.value = response.secret
    toast.success('Código QR generado correctamente')
  } catch (error) {
    toast.error('Error al generar el código QR')
  } finally {
    loading.value = false
  }
}

const verify2FA = async () => {
  if (verificationCode.value.length !== 6) {
    toast.error('El código debe tener 6 dígitos')
    return
  }

  verifying.value = true
  try {
    await authStore.verify2FA(verificationCode.value)
    toast.success('¡2FA activado exitosamente!')
    router.push('/dashboard')
  } catch (error) {
    toast.error('Código incorrecto. Por favor intenta de nuevo.')
  } finally {
    verifying.value = false
  }
}

const copySecret = () => {
  navigator.clipboard.writeText(secret.value)
  toast.success('Código copiado al portapapeles')
}
</script>