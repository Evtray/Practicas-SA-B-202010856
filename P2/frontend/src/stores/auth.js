import { defineStore } from 'pinia'
import { authApi } from '@/api/auth'
import { usersApi } from '@/api/users'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    isAuthenticated: false,
    loading: false,
    error: null,
    tempToken: null,
  }),

  getters: {
    isEmailVerified: (state) => state.user?.isEmailVerified || false,
    has2FA: (state) => state.user?.has2FA || state.user?.twoFactorEnabled || false,
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
        
        if (response.data.requiresTwoFactor) {
          this.tempToken = response.data.tempToken
          return response.data
        }
        
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

    async verify2FALogin(code) {
      this.loading = true
      this.error = null
      try {
        if (!this.tempToken) {
          throw new Error('No temporary token available')
        }
        const response = await authApi.verify2FA(this.tempToken, code)
        this.user = response.data.user
        this.isAuthenticated = true
        this.tempToken = null
        return response.data
      } catch (error) {
        this.error = error.response?.data?.error || '2FA verification failed'
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
        const response = await usersApi.getProfile()
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

    async confirm2FA(code) {
      this.loading = true
      this.error = null
      try {
        const response = await authApi.confirm2FA(code)
        if (this.user) {
          this.user.twoFactorEnabled = true
        }
        return response.data
      } catch (error) {
        this.error = error.response?.data?.error || '2FA confirmation failed'
        throw error
      } finally {
        this.loading = false
      }
    },

    async updateProfile(data) {
      this.loading = true
      this.error = null
      try {
        const response = await usersApi.updateProfile(data)
        this.user = response.data.user
        return response.data
      } catch (error) {
        this.error = error.response?.data?.error || 'Profile update failed'
        throw error
      } finally {
        this.loading = false
      }
    },

    async changePassword(data) {
      this.loading = true
      this.error = null
      try {
        const response = await usersApi.changePassword(data)
        return response.data
      } catch (error) {
        this.error = error.response?.data?.error || 'Password change failed'
        throw error
      } finally {
        this.loading = false
      }
    },

    async disable2FA(password) {
      this.loading = true
      this.error = null
      try {
        const response = await usersApi.disable2FA(password)
        if (this.user) {
          this.user.twoFactorEnabled = false
        }
        return response.data
      } catch (error) {
        this.error = error.response?.data?.error || '2FA disable failed'
        throw error
      } finally {
        this.loading = false
      }
    },
  },
})