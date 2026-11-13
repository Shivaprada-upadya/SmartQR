
const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'
).replace(/\/+$/, '')

export const getToken = () => {
  return sessionStorage.getItem('smartqr_token')
}

export const saveToken = (token) => {
  sessionStorage.setItem('smartqr_token', token)
}

export const clearToken = () => {
  sessionStorage.removeItem('smartqr_token')
}

export const apiRequest = async (path, options = {}) => {
  const headers = new Headers(options.headers || {})
  const token = getToken()

  if (options.body && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json')
  }

  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  })

  let data = null

  try {
    data = await response.json()
  } catch {
    // The response may have no JSON body.
  }

  if (!response.ok) {
    if (response.status === 401 && token) {
      clearToken()
    }

    const error = new Error(
      data?.message || `Request failed with status ${response.status}`,
    )

    error.status = response.status
    error.code = data?.code

    throw error
  }

  return data
}
