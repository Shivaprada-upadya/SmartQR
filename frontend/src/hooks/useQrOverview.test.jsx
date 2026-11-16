import { act, cleanup, renderHook, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import useQrOverview from './useQrOverview'

const mocks = vi.hoisted(() => ({
  getQrOverview: vi.fn(),
}))

vi.mock('../services/qr.service', () => ({
  getQrOverview: mocks.getQrOverview,
}))

beforeEach(() => {
  mocks.getQrOverview.mockReset()
})

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})

describe('useQrOverview', () => {
  it('loads account metrics for an authenticated user and refreshes on demand', async () => {
    const overview = {
      totalQrCodes: 4,
      activeQrCodes: 3,
      totalScans: 12,
      todayScans: 2,
      averageDailyScans: 1.5,
    }
    mocks.getQrOverview.mockResolvedValue({ data: overview })
    const user = { id: 'user-1' }
    const { result } = renderHook(() => useQrOverview(user))

    await waitFor(() => expect(result.current.overview).toBe(overview))
    expect(mocks.getQrOverview).toHaveBeenCalledOnce()

    act(() => result.current.refreshOverview())
    await waitFor(() => expect(mocks.getQrOverview).toHaveBeenCalledTimes(2))
  })

  it('surfaces failures and can reset overview state', async () => {
    mocks.getQrOverview.mockRejectedValue(new Error('Overview unavailable'))
    const user = { id: 'user-1' }
    const { result } = renderHook(() => useQrOverview(user))

    await waitFor(() => expect(result.current.overviewError).toBe(
      'Overview unavailable',
    ))
    await waitFor(() => expect(result.current.isLoadingOverview).toBe(false))
    expect(result.current.overview).toBeNull()

    act(() => result.current.resetOverview())

    expect(result.current.overviewError).toBe('')
    expect(result.current.isLoadingOverview).toBe(false)
  })

  it('does not request metrics without a user', () => {
    renderHook(() => useQrOverview(null))

    expect(mocks.getQrOverview).not.toHaveBeenCalled()
  })
})
