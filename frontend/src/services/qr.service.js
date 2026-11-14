
import { apiRequest } from './api'

export const getQrCodes = async ({
  page = 1,
  limit = 10,
  search,
  qrType,
  isActive,
  sortBy = 'createdAt',
  sortOrder = 'desc',
} = {}) => {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
    sortBy,
    sortOrder,
  })

  if (search?.trim()) {
    params.set('search', search.trim())
  }

  if (qrType) {
    params.set('qrType', qrType)
  }

  if (isActive !== undefined && isActive !== null) {
    params.set('isActive', String(isActive))
  }

  return apiRequest(`/qr?${params.toString()}`, {
    method: 'GET',
  })
}

export const createQrCode = async (qrData) => {
  return apiRequest('/qr', {
    method: 'POST',
    body: JSON.stringify(qrData),
  })
}

export const deleteQrCode = async (id) => {
  return apiRequest(`/qr/${id}`, {
    method: 'DELETE',
  })
}

export const updateQrCode = async (id, qrData) => {
  return apiRequest(`/qr/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(qrData),
  })
}
