import api from './axios'

export const authApi = {
  register: (data) => api.post('/auth/register', data),
  
  login: (data) => api.post('/auth/login', data),
  
  logout: () => api.post('/auth/logout'),
  
  verifyEmail: (token) => api.post('/auth/verify-email', { token }),
  
  resendVerificationEmail: (email) => api.post('/auth/resend-verification', { email }),
  
  setup2FA: () => api.post('/auth/2fa/setup'),
  
  verify2FA: (code) => api.post('/auth/2fa/verify', { code }),
  
  disable2FA: (code) => api.post('/auth/2fa/disable', { code }),
  
  refreshToken: () => api.post('/auth/refresh'),
  
  getProfile: () => api.get('/auth/profile'),
}