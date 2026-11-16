import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import useQrExport from './useQrExport'

const mocks = vi.hoisted(() => ({
  toDataURL: vi.fn(),
  toString: vi.fn(),
}))

vi.mock('qrcode', () => ({
  default: {
    toDataURL: mocks.toDataURL,
    toString: mocks.toString,
  },
}))

beforeEach(() => {
  mocks.toDataURL.mockReset()
  mocks.toString.mockReset()
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('useQrExport', () => {
  it('downloads a PNG with a safe filename and the selected dimensions', async () => {
    let downloadName
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(
      function click() {
        downloadName = this.download
      },
    )
    mocks.toDataURL.mockResolvedValue('data:image/png;base64,qr')
    const { result } = renderHook(() => useQrExport())

    await act(() =>
      result.current.downloadQr('https://example.com', 'My Summer QR', 'png'),
    )

    expect(mocks.toDataURL).toHaveBeenCalledWith(
      'https://example.com',
      expect.objectContaining({ width: 512, errorCorrectionLevel: 'H' }),
    )
    expect(downloadName).toBe('my-summer-qr.png')
    expect(result.current.exportError).toBe('')
  })

  it('surfaces export failures in state', async () => {
    mocks.toDataURL.mockRejectedValue(new Error('QR generation failed'))
    const { result } = renderHook(() => useQrExport())

    await act(() => result.current.downloadQr('text', 'Text QR', 'png'))

    expect(result.current.exportError).toBe(
      'Unable to export the QR code as PNG.',
    )
  })

  it('rejects dynamic list QR codes without short codes', () => {
    const { result } = renderHook(() => useQrExport())

    expect(() => result.current.downloadListQr({
      type: 'DYNAMIC',
      title: 'Broken QR',
      destination: 'https://example.com',
    }, 'png')).toThrow('Dynamic QR code is missing its short code.')
  })
})
