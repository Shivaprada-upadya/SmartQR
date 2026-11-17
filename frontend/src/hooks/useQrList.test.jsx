import { act, cleanup, renderHook, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import useQrList from './useQrList'

const mocks = vi.hoisted(() => ({
  getQrCodes: vi.fn(),
}))

vi.mock('../services/qr.service', () => ({
  getQrCodes: mocks.getQrCodes,
}))

const pagination = {
  page: 1,
  limit: 5,
  totalRecords: 1,
  totalPages: 1,
  hasNextPage: false,
  hasPreviousPage: false,
}

const response = {
  data: {
    qrCodes: [{
      id: 'qr-1',
      title: 'Event QR',
      destination: 'https://example.com/events',
      short_code: 'abc123',
      qr_type: 'url',
      is_active: true,
      created_at: '2026-11-16T00:00:00.000Z',
    }],
  },
  pagination,
}

beforeEach(() => {
  mocks.getQrCodes.mockReset()
})

afterEach(() => {
  cleanup()
  vi.useRealTimers()
  vi.restoreAllMocks()
})

describe('useQrList', () => {
  it('loads and formats QR codes and selects the first QR for analytics', async () => {
    mocks.getQrCodes.mockResolvedValue(response)
    const user = { id: 'user-1' }
    const setSelectedAnalyticsQr = vi.fn()
    const { result } = renderHook(() => useQrList(user, setSelectedAnalyticsQr))

    await waitFor(() => expect(result.current.qrCodes).toHaveLength(1))

    expect(mocks.getQrCodes).toHaveBeenCalledWith({
      page: 1,
      limit: 5,
      search: '',
      qrType: undefined,
      isActive: undefined,
      sortBy: 'createdAt',
      sortOrder: 'desc',
    })
    expect(result.current.qrCodes[0]).toMatchObject({
      id: 'qr-1',
      type: 'URL',
      status: 'Active',
    })
    expect(result.current.pagination).toBe(pagination)

    const selectAnalyticsQr = setSelectedAnalyticsQr.mock.calls[0][0]
    expect(selectAnalyticsQr(null)).toBe('qr-1')
    expect(selectAnalyticsQr('qr-selected')).toBe('qr-selected')
  })

  it('debounces search before requesting filtered QR codes', async () => {
    mocks.getQrCodes.mockResolvedValue(response)
    const user = { id: 'user-1' }
    const setSelectedAnalyticsQr = vi.fn()
    const { result } = renderHook(() =>
      useQrList(user, setSelectedAnalyticsQr),
    )
    await waitFor(() => expect(mocks.getQrCodes).toHaveBeenCalledOnce())

    vi.useFakeTimers()
    act(() => result.current.setSearchTerm('events'))
    expect(mocks.getQrCodes).toHaveBeenCalledOnce()

    await act(async () => {
      await vi.advanceTimersByTimeAsync(300)
    })

    expect(mocks.getQrCodes).toHaveBeenCalledTimes(2)
    expect(mocks.getQrCodes).toHaveBeenLastCalledWith(
      expect.objectContaining({ search: 'events' }),
    )
  })

  it('reports list failures and skips requests without an authenticated user', async () => {
    mocks.getQrCodes.mockRejectedValue(new Error('List unavailable'))
    const user = { id: 'user-1' }
    const { result } = renderHook(() => useQrList(user, vi.fn()))

    await waitFor(() =>
      expect(result.current.qrListError).toBe('List unavailable'),
    )

    expect(result.current.qrCodes).toEqual([])

    mocks.getQrCodes.mockClear()
    renderHook(() => useQrList(null, vi.fn()))
    expect(mocks.getQrCodes).not.toHaveBeenCalled()
  })
})
