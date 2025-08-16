import api from './axios'

export const usersApi = {
  getProfile: () => api.get('/api/users/profile'),
  
  updateProfile: (data) => api.put('/api/users/profile', data),
  
  changePassword: (data) => api.post('/api/users/change-password', data),
  
  disable2FA: (password) => api.delete('/api/users/2fa', { data: { password } }),
}