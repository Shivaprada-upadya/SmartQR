import { act, cleanup, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import useQrEdit from './useQrEdit'

const mocks = vi.hoisted(() => ({
  updateQrCode: vi.fn(),
}))

vi.mock('../services/qr.service', () => ({
  updateQrCode: mocks.updateQrCode,
}))

const qrCode = {
  id: 'qr-1',
  title: 'Old title',
  destination: 'https://example.com/old',
}

beforeEach(() => {
  mocks.updateQrCode.mockReset()
})

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})

describe('useQrEdit', () => {
  it('updates the QR record and reflects the edit in the current list', async () => {
    const setQrCodes = vi.fn()
    mocks.updateQrCode.mockResolvedValue({})
    const { result } = renderHook(() => useQrEdit(setQrCodes))

    act(() => result.current.handleEditClick(qrCode))
    act(() => {
      result.current.setEditTitle('  New title  ')
      result.current.setEditDestination('  https://example.com/new  ')
    })
    await act(() => result.current.handleUpdateQr({
      preventDefault: vi.fn(),
    }))

    expect(mocks.updateQrCode).toHaveBeenCalledWith('qr-1', {
      title: 'New title',
      destination: 'https://example.com/new',
    })
    const updateList = setQrCodes.mock.calls[0][0]
    expect(updateList([qrCode])[0]).toMatchObject({
      title: 'New title',
      destination: 'https://example.com/new',
    })
    expect(result.current.editingQr).toBeNull()
    expect(result.current.editTitle).toBe('')
    expect(result.current.editDestination).toBe('')
  })

  it('requires a title and destination before calling the API', async () => {
    const setQrCodes = vi.fn()
    const { result } = renderHook(() => useQrEdit(setQrCodes))

    act(() => result.current.handleEditClick(qrCode))
    act(() => result.current.setEditTitle(' '))
    await act(() => result.current.handleUpdateQr({
      preventDefault: vi.fn(),
    }))

    expect(result.current.editError).toBe(
      'Please enter both title and destination.',
    )
    expect(mocks.updateQrCode).not.toHaveBeenCalled()
  })
})
