import { act, cleanup, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import useQrManagement from './useQrManagement'

const mocks = vi.hoisted(() => ({
  bulkManageQrCodes: vi.fn(),
  deleteQrCode: vi.fn(),
}))

vi.mock('../services/qr.service', () => ({
  bulkManageQrCodes: mocks.bulkManageQrCodes,
  deleteQrCode: mocks.deleteQrCode,
}))

beforeEach(() => {
  mocks.bulkManageQrCodes.mockReset()
  mocks.deleteQrCode.mockReset()
})

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})

function renderQrManagement(overrides = {}) {
  const props = {
    qrCodes: [{ id: 'qr-1', title: 'Event QR' }],
    selectedQrIds: ['qr-1'],
    setSelectedQrIds: vi.fn(),
    selectedAnalyticsQr: 'qr-1',
    setSelectedAnalyticsQr: vi.fn(),
    currentPage: 1,
    setCurrentPage: vi.fn(),
    refreshQrCodes: vi.fn(),
    refreshOverview: vi.fn(),
    setQrListError: vi.fn(),
    ...overrides,
  }

  return { ...renderHook(() => useQrManagement(props)), props }
}

describe('useQrManagement', () => {
  it('confirms and completes a single QR deletion', async () => {
    mocks.deleteQrCode.mockResolvedValue({})
    const { result, props } = renderQrManagement()

    act(() => result.current.handleDeleteQr('qr-1'))
    expect(result.current.deleteConfirmation).toMatchObject({
      type: 'single',
      title: 'Event QR',
    })

    await act(() => result.current.handleConfirmDelete())

    expect(mocks.deleteQrCode).toHaveBeenCalledWith('qr-1')
    expect(props.refreshOverview).toHaveBeenCalledOnce()
    expect(props.refreshQrCodes).toHaveBeenCalledOnce()
    expect(props.setSelectedAnalyticsQr).toHaveBeenCalledWith('')
    expect(result.current.deleteConfirmation).toBeNull()
  })

  it('requires confirmation before bulk deletion and refreshes after success', async () => {
    mocks.bulkManageQrCodes.mockResolvedValue({ message: 'Deleted 2 QR codes.' })
    const props = {
      selectedQrIds: ['qr-1', 'qr-2'],
      selectedAnalyticsQr: 'qr-2',
    }
    const { result, props: managementProps } = renderQrManagement(props)

    await act(() => result.current.handleBulkAction('delete'))

    expect(mocks.bulkManageQrCodes).not.toHaveBeenCalled()
    expect(result.current.deleteConfirmation).toEqual({
      type: 'bulk',
      ids: props.selectedQrIds,
    })

    await act(() => result.current.handleConfirmDelete())

    expect(mocks.bulkManageQrCodes).toHaveBeenCalledWith({
      ids: props.selectedQrIds,
      action: 'delete',
    })
    expect(managementProps.setSelectedQrIds).toHaveBeenCalledWith([])
    expect(managementProps.setSelectedAnalyticsQr).toHaveBeenCalledWith('')
    expect(managementProps.refreshOverview).toHaveBeenCalledOnce()
    expect(result.current.bulkActionMessage).toBe('Deleted 2 QR codes.')
  })

  it('surfaces errors when bulk actions fail', async () => {
    mocks.bulkManageQrCodes.mockRejectedValue(new Error('Action failed'))
    const { result } = renderQrManagement()

    await act(() => result.current.handleBulkAction('activate'))

    expect(result.current.bulkActionError).toBe('Action failed')
    expect(result.current.isBulkManaging).toBe(false)
  })
})
