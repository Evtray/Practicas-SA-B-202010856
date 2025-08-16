import { defineStore } from 'pinia'
import { authApi } from '@/api/auth'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    isAuthenticated: false,
    loading: false,
    error: null,
  }),

  getters: {
    isEmailVerified: (state) => state.user?.isEmailVerified || false,
    has2FA: (state) => state.user?.has2FA || false,
  },

  actions: {
    async register(userData) {
      this.loading = true
      this.error = null
      try {
        const response = await authApi.register(userData)
        return response.data
      } catch (error) {
        this.error = error.response?.data?.error || 'Registration failed'
        throw error
      } finally {
        this.loading = false
      }
    },

    async login(credentials) {
      this.loading = true
      this.error = null
      try {
        const response = await authApi.login(credentials)
        this.user = response.data.user
        this.isAuthenticated = true
        return response.data
      } catch (error) {
        this.error = error.response?.data?.error || 'Login failed'
        throw error
      } finally {
        this.loading = false
      }
    },

    async logout() {
      try {
        await authApi.logout()
      } catch (error) {
        console.error('Logout error:', error)
      } finally {
        this.user = null
        this.isAuthenticated = false
      }
    },

    async verifyEmail(token) {
      this.loading = true
      this.error = null
      try {
        const response = await authApi.verifyEmail(token)
        if (this.user) {
          this.user.isEmailVerified = true
        }
        return response.data
      } catch (error) {
        this.error = error.response?.data?.error || 'Email verification failed'
        throw error
      } finally {
        this.loading = false
      }
    },

    async fetchProfile() {
      try {
        const response = await authApi.getProfile()
        this.user = response.data.user
        this.isAuthenticated = true
        return response.data
      } catch (error) {
        this.user = null
        this.isAuthenticated = false
        throw error
      }
    },

    async setup2FA() {
      this.loading = true
      this.error = null
      try {
        const response = await authApi.setup2FA()
        return response.data
      } catch (error) {
        this.error = error.response?.data?.error || '2FA setup failed'
        throw error
      } finally {
        this.loading = false
      }
    },

    async verify2FA(code) {
      this.loading = true
      this.error = null
      try {
        const response = await authApi.verify2FA(code)
        if (this.user) {
          this.user.has2FA = true
        }
        return response.data
      } catch (error) {
        this.error = error.response?.data?.error || '2FA verification failed'
        throw error
      } finally {
        this.loading = false
      }
    },
  },
})