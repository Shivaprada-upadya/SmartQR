import { act, cleanup, renderHook, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import useQrAnalytics from './useQrAnalytics'

const mocks = vi.hoisted(() => ({
  getQrAnalytics: vi.fn(),
}))

vi.mock('../services/qr.service', () => ({
  getQrAnalytics: mocks.getQrAnalytics,
}))

beforeEach(() => {
  mocks.getQrAnalytics.mockReset()
})

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})

describe('useQrAnalytics', () => {
  it('fetches analytics for the selected QR and range', async () => {
    const response = { data: { summary: { total_scans: 12 } } }
    mocks.getQrAnalytics.mockResolvedValue(response)
    const { result } = renderHook(() => useQrAnalytics({ id: 'user-1' }))

    act(() => result.current.setSelectedQr('qr-1'))
    await waitFor(() => expect(result.current.analytics).toBe(response.data))

    expect(mocks.getQrAnalytics).toHaveBeenCalledWith('qr-1', '7d')

    act(() => result.current.setRange('30d'))
    await waitFor(() => expect(mocks.getQrAnalytics).toHaveBeenCalledWith(
      'qr-1',
      '30d',
    ))
  })

  it('clears analytics and reports request failures', async () => {
    mocks.getQrAnalytics.mockRejectedValue(new Error('Analytics unavailable'))
    const { result } = renderHook(() => useQrAnalytics({ id: 'user-1' }))

    act(() => result.current.setSelectedQr('qr-1'))
    await waitFor(() => expect(result.current.analyticsError).toBe(
      'Analytics unavailable',
    ))

    expect(result.current.analytics).toBeNull()
  })

  it('does not request analytics before a QR is selected', () => {
    renderHook(() => useQrAnalytics({ id: 'user-1' }))

    expect(mocks.getQrAnalytics).not.toHaveBeenCalled()
  })
})
