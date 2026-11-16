import { cleanup, render, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import QrCodeTable from './QrCodeTable'

afterEach(cleanup)

const qrCode = {
  id: 'qr-1',
  title: 'Event QR',
  destination: 'https://example.com/events/summer',
  type: 'URL',
  status: 'Active',
  created: '16 Nov 2026',
}

function renderQrCodeTable(overrides = {}) {
  const props = {
    qrCodes: [qrCode],
    isLoadingQrs: false,
    qrListError: '',
    selectedQrIds: [],
    isBulkManaging: false,
    onTogglePageSelection: vi.fn(),
    onToggleSelection: vi.fn(),
    onEdit: vi.fn(),
    onDownload: vi.fn(),
    onDelete: vi.fn(),
    ...overrides,
  }

  return { ...render(<QrCodeTable {...props} />), props }
}

describe('QrCodeTable responsive cards', () => {
  it('keeps selection and row actions available in the mobile card view', async () => {
    const user = userEvent.setup()
    const { container, props } = renderQrCodeTable()
    const mobileView = container.querySelector('.qr-mobile-view')
    const card = within(mobileView).getByRole('listitem')

    expect(within(card).getByText(qrCode.destination)).toBeTruthy()
    expect(within(card).getByText(qrCode.created)).toBeTruthy()

    await user.click(within(card).getByRole('checkbox', {
      name: 'Select Event QR',
    }))
    await user.click(within(card).getByRole('button', {
      name: 'Download PNG for Event QR',
    }))
    await user.click(within(card).getByRole('button', {
      name: 'Delete Event QR',
    }))

    expect(props.onToggleSelection).toHaveBeenCalledWith(qrCode.id)
    expect(props.onDownload).toHaveBeenCalledWith(qrCode, 'png')
    expect(props.onDelete).toHaveBeenCalledWith(qrCode.id)
  })

  it('provides a select-all control in the mobile card view', async () => {
    const user = userEvent.setup()
    const { container, props } = renderQrCodeTable()
    const mobileView = container.querySelector('.qr-mobile-view')

    await user.click(within(mobileView).getByRole('checkbox', {
      name: 'Select all QR codes on this page',
    }))

    expect(props.onTogglePageSelection).toHaveBeenCalledOnce()
  })
})
