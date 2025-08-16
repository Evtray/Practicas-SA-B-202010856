import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const routes = [
  {
    path: '/',
    name: 'home',
    component: () => import('@/pages/Home.vue'),
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('@/pages/Login.vue'),
    meta: { requiresGuest: true },
  },
  {
    path: '/register',
    name: 'register',
    component: () => import('@/pages/Register.vue'),
    meta: { requiresGuest: true },
  },
  {
    path: '/verify-email',
    name: 'verify-email',
    component: () => import('@/pages/VerifyEmail.vue'),
  },
  {
    path: '/dashboard',
    name: 'dashboard',
    component: () => import('@/pages/Dashboard.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/profile',
    name: 'profile',
    component: () => import('@/pages/Profile.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/setup-2fa',
    name: 'setup-2fa',
    component: () => import('@/pages/Setup2FA.vue'),
    meta: { requiresAuth: true },
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

// Navigation guards
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()

  // Check if route requires authentication
  if (to.meta.requiresAuth) {
    // Only try to fetch profile once per session and only for protected routes
    if (!authStore.initialized && !authStore.loading) {
      try {
        await authStore.fetchProfile()
        // If successful, user is authenticated
        return next()
      } catch (error) {
        // User is not authenticated, redirect to login
        return next('/login')
      }
    }
    
    // If already initialized, check authentication status
    if (!authStore.isAuthenticated) {
      return next('/login')
    }
  }

  // Check if route requires guest (not authenticated)
  // Don't check profile for guest routes
  if (to.meta.requiresGuest && authStore.isAuthenticated) {
    return next('/dashboard')
  }

  next()
})

export default router