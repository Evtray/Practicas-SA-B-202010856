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

            <div v-if="backupCodes.length > 0" class="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
              <div class="flex items-center justify-between mb-3">
                <h3 class="font-semibold text-yellow-800 dark:text-yellow-200">
                  ⚠️ Códigos de Respaldo Importantes
                </h3>
                <Button @click="downloadBackupCodes" variant="outline" size="sm">
                  Descargar
                </Button>
              </div>
              <p class="text-sm text-yellow-700 dark:text-yellow-300 mb-4">
                Guarda estos códigos en un lugar seguro. Cada uno puede usarse una sola vez para acceder a tu cuenta si pierdes tu dispositivo 2FA.
              </p>
              <div class="grid grid-cols-2 gap-2 mb-3">
                <code v-for="code in backupCodes" :key="code" class="p-2 bg-white dark:bg-slate-800 rounded text-center font-mono text-sm border border-slate-200 dark:border-slate-700">
                  {{ code }}
                </code>
              </div>
              <div class="flex items-center gap-2">
                <Button @click="copyBackupCodes" variant="outline" size="sm" class="flex-1">
                  Copiar todos los códigos
                </Button>
              </div>
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
const backupCodes = ref([])
const verificationCode = ref('')

const setup2FA = async () => {
  loading.value = true
  try {
    const response = await authStore.setup2FA()
    qrCodeUrl.value = response.qrCode
    secret.value = response.secret
    backupCodes.value = response.backupCodes || []
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
    await authStore.confirm2FA(verificationCode.value)
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

const copyBackupCodes = () => {
  const codesText = backupCodes.value.join('\n')
  navigator.clipboard.writeText(codesText)
  toast.success('Códigos de respaldo copiados al portapapeles')
}

const downloadBackupCodes = () => {
  const codesText = `Códigos de Respaldo - 2FA\n` +
    `Fecha: ${new Date().toLocaleString()}\n\n` +
    `IMPORTANTE: Guarda estos códigos en un lugar seguro.\n` +
    `Cada código puede usarse una sola vez.\n\n` +
    backupCodes.value.join('\n')
  
  const blob = new Blob([codesText], { type: 'text/plain' })
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `backup-codes-${new Date().getTime()}.txt`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  window.URL.revokeObjectURL(url)
  
  toast.success('Códigos de respaldo descargados')
}
</script>