import { act, cleanup, renderHook, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import useSession from './useSession'

const mocks = vi.hoisted(() => ({
  getToken: vi.fn(),
  getCurrentUser: vi.fn(),
  logout: vi.fn(),
}))

vi.mock('../services/api', () => ({
  getToken: mocks.getToken,
}))

vi.mock('../services/auth.service', () => ({
  getCurrentUser: mocks.getCurrentUser,
  logout: mocks.logout,
}))

beforeEach(() => {
  mocks.getToken.mockReset()
  mocks.getCurrentUser.mockReset()
  mocks.logout.mockReset()
})

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})

describe('useSession', () => {
  it('restores an authenticated user from the saved session', async () => {
    const user = { id: 'user-1', name: 'Sample User' }
    mocks.getToken.mockReturnValue('token')
    mocks.getCurrentUser.mockResolvedValue(user)
    const { result } = renderHook(() => useSession())

    await waitFor(() => expect(result.current.user).toBe(user))

    expect(result.current.isCheckingSession).toBe(false)
  })

  it('skips restoration when there is no saved token', async () => {
    mocks.getToken.mockReturnValue(null)
    const { result } = renderHook(() => useSession())

    await waitFor(() => expect(result.current.isCheckingSession).toBe(false))

    expect(mocks.getCurrentUser).not.toHaveBeenCalled()
  })

  it('clears invalid and explicitly logged-out sessions', async () => {
    mocks.getToken.mockReturnValue('expired-token')
    mocks.getCurrentUser.mockRejectedValue(new Error('Unauthorized'))
    const { result } = renderHook(() => useSession())

    await waitFor(() => expect(result.current.isCheckingSession).toBe(false))
    expect(mocks.logout).toHaveBeenCalledOnce()

    act(() => result.current.setUser({ id: 'user-1' }))
    act(() => result.current.clearSession())

    expect(result.current.user).toBeNull()
    expect(mocks.logout).toHaveBeenCalledTimes(2)
  })
})
