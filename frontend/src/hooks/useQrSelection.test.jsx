import { act, cleanup, renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import useQrSelection from './useQrSelection'

afterEach(cleanup)

const qrCodes = [{ id: 1 }, { id: '2' }]

describe('useQrSelection', () => {
  it('toggles individual selections consistently as string IDs', () => {
    const { result } = renderHook(() => useQrSelection(qrCodes))

    act(() => result.current.handleToggleSelection(1))
    expect(result.current.selectedQrIds).toEqual(['1'])

    act(() => result.current.handleToggleSelection('1'))
    expect(result.current.selectedQrIds).toEqual([])
  })

  it('selects and deselects all QR codes on the current page', () => {
    const { result } = renderHook(() => useQrSelection(qrCodes))

    act(() => result.current.handleTogglePageSelection())
    expect(result.current.selectedQrIds).toEqual(['1', '2'])

    act(() => result.current.handleTogglePageSelection())
    expect(result.current.selectedQrIds).toEqual([])
  })

  it('clears selected QR codes', () => {
    const { result } = renderHook(() => useQrSelection(qrCodes))

    act(() => result.current.setSelectedQrIds(['1']))
    act(() => result.current.clearSelection())

    expect(result.current.selectedQrIds).toEqual([])
  })
})
