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

  it('clears loaded analytics when the selected QR is cleared', async () => {
    const response = { data: { summary: { total_scans: 12 } } }
    mocks.getQrAnalytics.mockResolvedValue(response)
    const { result } = renderHook(() => useQrAnalytics({ id: 'user-1' }))

    act(() => result.current.setSelectedQr('qr-1'))
    await waitFor(() => expect(result.current.analytics).toBe(response.data))

    act(() => result.current.setSelectedQr(''))

    await waitFor(() => expect(result.current.analytics).toBeNull())
    expect(result.current.analyticsError).toBe('')
    expect(result.current.isLoadingAnalytics).toBe(false)
  })

  it('ignores a stale response after selecting a different QR', async () => {
    const resolveRequest = {}
    mocks.getQrAnalytics.mockImplementation(
      (qrId) =>
        new Promise((resolve) => {
          resolveRequest[qrId] = resolve
        }),
    )
    const user = { id: 'user-1' }
    const { result } = renderHook(() => useQrAnalytics(user))

    act(() => result.current.setSelectedQr('qr-1'))
    await waitFor(() => expect(resolveRequest['qr-1']).toBeDefined())

    act(() => result.current.setSelectedQr('qr-2'))
    await waitFor(() => expect(resolveRequest['qr-2']).toBeDefined())

    await act(async () => {
      resolveRequest['qr-1']({ data: { summary: { total_scans: 1 } } })
    })
    expect(result.current.analytics).toBeNull()

    await act(async () => {
      resolveRequest['qr-2']({ data: { summary: { total_scans: 2 } } })
    })
    await waitFor(() =>
      expect(result.current.analytics?.summary?.total_scans).toBe(2),
    )
  })
})
