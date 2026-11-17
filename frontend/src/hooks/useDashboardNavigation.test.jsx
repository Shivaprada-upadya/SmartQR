import { act, cleanup, renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import useDashboardNavigation from './useDashboardNavigation'

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})

describe('useDashboardNavigation', () => {
  it('derives initials and marks the target section active when navigating', () => {
    const section = document.createElement('section')
    section.id = 'recent'
    section.scrollIntoView = vi.fn()
    document.body.append(section)
    const { result } = renderHook(() =>
      useDashboardNavigation({ name: 'Jane Doe' }),
    )

    expect(result.current.userInitials).toBe('JD')

    act(() => result.current.scrollToSection('recent', 'My QR Codes'))

    expect(result.current.activeNav).toBe('My QR Codes')
    expect(section.scrollIntoView).toHaveBeenCalledWith({
      behavior: 'smooth',
      block: 'start',
    })
    section.remove()
  })

  it('returns no initials when the user has no name', () => {
    const { result } = renderHook(() => useDashboardNavigation({}))

    expect(result.current.userInitials).toBeUndefined()
  })
})
