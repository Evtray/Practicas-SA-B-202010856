import api from './axios'

export const authApi = {
  register: (data) => api.post('/api/auth/register', data),
  
  login: (data) => api.post('/api/auth/login', data),
  
  logout: () => api.post('/api/auth/logout'),
  
  verifyEmail: (token) => api.get(`/api/auth/verify-email?token=${token}`),
  
  verify2FA: (tempToken, code) => api.post('/api/auth/verify-2fa', { tempToken, code }),
  
  setup2FA: () => api.post('/api/auth/setup-2fa'),
  
  confirm2FA: (code) => api.post('/api/auth/confirm-2fa', { code }),
  
  refreshToken: () => api.post('/api/auth/refresh'),
}