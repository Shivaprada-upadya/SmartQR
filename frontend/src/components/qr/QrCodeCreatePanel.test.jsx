import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import QrCodeCreatePanel from './QrCodeCreatePanel'

afterEach(cleanup)

const createProps = (overrides = {}) => ({
  title: '',
  destination: '',
  qrType: 'URL',
  qrMode: 'static',
  isGenerating: false,
  error: '',
  generatedQR: '',
  generatedTitle: '',
  qrExportSize: '512',
  exportError: '',
  onTitleChange: vi.fn(),
  onDestinationChange: vi.fn(),
  onQrModeChange: vi.fn(),
  onQrTypeChange: vi.fn(),
  onQrExportSizeChange: vi.fn(),
  onSubmit: vi.fn(),
  onDownload: vi.fn(),
  ...overrides,
})

describe('QrCodeCreatePanel', () => {
  it('offers static and dynamic modes, and explains the text restriction', async () => {
    const user = userEvent.setup()
    const onQrModeChange = vi.fn()
    const { rerender } = render(
      <QrCodeCreatePanel {...createProps({ onQrModeChange })} />,
    )

    expect(screen.getByLabelText('QR code name')).toBeTruthy()
    expect(screen.getByLabelText('Website URL')).toBeTruthy()
    await user.click(screen.getByRole('radio', { name: /Dynamic/ }))

    expect(onQrModeChange).toHaveBeenCalledWith('dynamic')

    rerender(
      <QrCodeCreatePanel
        {...createProps({ qrMode: 'dynamic', onQrModeChange })}
      />,
    )

    expect(screen.getByRole('option', { name: 'Plain text' }).disabled).toBe(
      true,
    )
  })

  it('shows the generated preview and preserves the export actions', async () => {
    const user = userEvent.setup()
    const onDownload = vi.fn()
    const onQrExportSizeChange = vi.fn()
    render(
      <QrCodeCreatePanel
        {...createProps({
          generatedQR: 'data:image/png;base64,qr',
          generatedTitle: 'Event QR',
          exportError: 'Unable to export the QR code as SVG.',
          onDownload,
          onQrExportSizeChange,
        })}
      />,
    )

    expect(screen.getByRole('img', { name: 'QR code for Event QR' })).toBeTruthy()
    expect(screen.getByRole('alert').textContent).toContain(
      'Unable to export the QR code as SVG.',
    )

    await user.selectOptions(screen.getByLabelText('Export dimensions'), '1024')
    await user.click(screen.getByRole('button', { name: 'Download PNG' }))
    await user.click(screen.getByRole('button', { name: 'Download SVG' }))

    expect(onQrExportSizeChange).toHaveBeenCalledWith('1024')
    expect(onDownload.mock.calls).toEqual([['png'], ['svg']])
  })

  it('shows validation feedback and prevents submission while generating', () => {
    render(
      <QrCodeCreatePanel
        {...createProps({
          isGenerating: true,
          error: 'Enter a valid URL, including https://',
        })}
      />,
    )

    expect(screen.getByRole('alert').textContent).toContain(
      'Enter a valid URL, including https://',
    )
    expect(screen.getByRole('button', { name: /Creating QR code/ }).disabled).toBe(
      true,
    )
    expect(
      screen.getByRole('heading', { name: 'Creating your QR code' }),
    ).toBeTruthy()
  })
})
