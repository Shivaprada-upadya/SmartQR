import { describe, expect, it, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import useQrListControls from './useQrListControls'

function renderQrListControls() {
  const props = {
    clearSelection: vi.fn(),
    clearBulkActionFeedback: vi.fn(),
    setSearchTerm: vi.fn(),
    setQrTypeFilter: vi.fn(),
    setStatusFilter: vi.fn(),
    setPageSize: vi.fn(),
    setCurrentPage: vi.fn(),
  }

  return { ...renderHook(() => useQrListControls(props)), props }
}

describe('useQrListControls', () => {
  it('resets page and clears selection when the search changes', () => {
    const { result, props } = renderQrListControls()

    act(() => result.current.handleSearchChange('event'))

    expect(props.clearSelection).toHaveBeenCalledOnce()
    expect(props.clearBulkActionFeedback).toHaveBeenCalledOnce()
    expect(props.setSearchTerm).toHaveBeenCalledWith('event')
    expect(props.setCurrentPage).toHaveBeenCalledWith(1)
  })

  it('clears all filters and selection when filters reset', () => {
    const { result, props } = renderQrListControls()

    act(() => result.current.handleResetFilters())

    expect(props.clearSelection).toHaveBeenCalledOnce()
    expect(props.clearBulkActionFeedback).toHaveBeenCalledOnce()
    expect(props.setSearchTerm).toHaveBeenCalledWith('')
    expect(props.setQrTypeFilter).toHaveBeenCalledWith('')
    expect(props.setStatusFilter).toHaveBeenCalledWith('')
    expect(props.setCurrentPage).toHaveBeenCalledWith(1)
  })

  it('clears selection on page changes while preserving the requested page', () => {
    const { result, props } = renderQrListControls()

    act(() => result.current.handlePageChange(3))

    expect(props.clearSelection).toHaveBeenCalledOnce()
    expect(props.clearBulkActionFeedback).toHaveBeenCalledOnce()
    expect(props.setCurrentPage).toHaveBeenCalledWith(3)
  })
})
