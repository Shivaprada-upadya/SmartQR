import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import QrCodeManagementPanel from './QrCodeManagementPanel'

afterEach(cleanup)

const qrCode = {
  id: 'qr-1',
  title: 'Event QR',
  destination: 'https://example.com/events',
  type: 'STATIC',
  status: 'Active',
  created: '20 Nov 2026',
}

describe('QrCodeManagementPanel', () => {
  it('renders the library summary and routes filter and selection actions', async () => {
    const user = userEvent.setup()
    const actions = {
      onViewAll: vi.fn(),
      onSearchChange: vi.fn(),
      onQrTypeFilterChange: vi.fn(),
      onStatusFilterChange: vi.fn(),
      onResetFilters: vi.fn(),
      onBulkAction: vi.fn(),
      onTogglePageSelection: vi.fn(),
      onToggleSelection: vi.fn(),
      onEdit: vi.fn(),
      onDownload: vi.fn(),
      onDelete: vi.fn(),
      onPageSizeChange: vi.fn(),
      onPageChange: vi.fn(),
    }
    render(
      <QrCodeManagementPanel
        data={{
          qrCodes: [qrCode],
          isLoadingQrs: false,
          qrListError: '',
          selectedQrIds: ['qr-1'],
          isBulkManaging: false,
          bulkActionError: '',
          bulkActionMessage: '',
          searchTerm: '',
          qrTypeFilter: '',
          statusFilter: '',
          pagination: {
            totalRecords: 1,
            totalPages: 1,
            hasPreviousPage: false,
            hasNextPage: false,
          },
          currentPage: 1,
          pageSize: 5,
        }}
        actions={actions}
      />,
    )

    expect(screen.getByRole('heading', { name: 'QR code library' })).toBeTruthy()
    expect(screen.getByText('1 QR code')).toBeTruthy()
    expect(screen.getByText('1 selected')).toBeTruthy()

    await user.type(screen.getByLabelText('Search'), 'event')
    await user.selectOptions(screen.getByLabelText('QR type'), 'dynamic')
    await user.selectOptions(screen.getByLabelText('Status'), 'true')
    await user.click(screen.getByRole('button', { name: 'Activate' }))

    expect(actions.onSearchChange).toHaveBeenCalled()
    expect(actions.onQrTypeFilterChange).toHaveBeenCalledWith('dynamic')
    expect(actions.onStatusFilterChange).toHaveBeenCalledWith('true')
    expect(actions.onBulkAction).toHaveBeenCalledWith('activate')
  })
})
