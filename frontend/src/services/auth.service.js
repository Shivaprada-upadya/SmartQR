
import { apiRequest, saveToken, clearToken } from './api'

export const registerAccount = async ({ name, email, password }) => {
  return apiRequest('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ name, email, password }),
  })
}

export const login = async ({ email, password }) => {
  const response = await apiRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })

  const { user, token } = response.data || {}

  if (!token || !user) {
    throw new Error('Invalid login response from server')
  }

  saveToken(token)

  return user
}

export const getCurrentUser = async () => {
  const response = await apiRequest('/auth/me', {
    method: 'GET',
  })

  return response.data.user
}

export const logout = () => {
  clearToken()
}
