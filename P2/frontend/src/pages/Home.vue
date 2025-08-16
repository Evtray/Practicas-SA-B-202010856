<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
    <div class="container mx-auto px-4 py-16">
      <div class="text-center mb-12">
        <h1 class="text-5xl font-bold text-slate-900 dark:text-slate-50 mb-4">
          Sistema de Autenticación
        </h1>
        <p class="text-lg text-slate-600 dark:text-slate-400">
          Seguridad avanzada con JWT, 2FA y encriptación AES
        </p>
      </div>

      <div class="max-w-4xl mx-auto grid md:grid-cols-2 gap-8">
        <Card className="p-6">
          <h2 class="text-2xl font-semibold mb-4">Características</h2>
          <ul class="space-y-3">
            <li class="flex items-start">
              <span class="text-green-500 mr-2">✓</span>
              <span>Autenticación JWT con cookies seguras</span>
            </li>
            <li class="flex items-start">
              <span class="text-green-500 mr-2">✓</span>
              <span>Encriptación AES para datos sensibles</span>
            </li>
            <li class="flex items-start">
              <span class="text-green-500 mr-2">✓</span>
              <span>Autenticación de dos factores (2FA)</span>
            </li>
            <li class="flex items-start">
              <span class="text-green-500 mr-2">✓</span>
              <span>Verificación por correo electrónico</span>
            </li>
            <li class="flex items-start">
              <span class="text-green-500 mr-2">✓</span>
              <span>Protección contra fuerza bruta</span>
            </li>
          </ul>
        </Card>

        <Card className="p-6">
          <h2 class="text-2xl font-semibold mb-4">Comenzar</h2>
          <div class="space-y-4">
            <p class="text-slate-600 dark:text-slate-400">
              Crea una cuenta o inicia sesión para acceder al sistema.
            </p>
            <div class="flex flex-col sm:flex-row gap-4">
              <Button 
                @click="$router.push('/register')"
                size="lg"
                class="flex-1"
              >
                Registrarse
              </Button>
              <Button 
                @click="$router.push('/login')"
                variant="outline"
                size="lg"
                class="flex-1"
              >
                Iniciar Sesión
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  </div>
</template>

<script setup>
import Card from '@/components/ui/Card.vue'
import Button from '@/components/ui/Button.vue'
</script>