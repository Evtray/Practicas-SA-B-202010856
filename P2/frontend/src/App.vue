<template>
  <router-view />
</template>

<script setup>
import { onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()

// onMounted(async () => {
//   // Try to get user profile on app mount
//   try {
//     await authStore.fetchProfile()
//   } catch (error) {
//     // User is not authenticated, that's ok
//   }
// })
</script>