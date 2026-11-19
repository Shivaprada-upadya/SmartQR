import { act, cleanup, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import useQrCreation from './useQrCreation'

const mocks = vi.hoisted(() => ({
  createQrCode: vi.fn(),
  toDataURL: vi.fn(),
}))

vi.mock('qrcode', () => ({
  default: { toDataURL: mocks.toDataURL },
}))

vi.mock('../services/qr.service', () => ({
  createQrCode: mocks.createQrCode,
}))

beforeEach(() => {
  mocks.createQrCode.mockReset()
  mocks.toDataURL.mockReset()
})

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})

describe('useQrCreation', () => {
  it('rejects empty form fields without calling the API', async () => {
    const { result } = renderHook(() => useQrCreation(vi.fn()))
    const event = { preventDefault: vi.fn() }

    await act(() => result.current.handleGenerate(event))

    expect(event.preventDefault).toHaveBeenCalledOnce()
    expect(result.current.error).toBe(
      'Please enter both a QR title and content.',
    )
    expect(mocks.createQrCode).not.toHaveBeenCalled()
  })

  it('creates a dynamic QR, exposes its image, and signals the refresh callback', async () => {
    const onCreated = vi.fn()
    mocks.createQrCode.mockResolvedValue({
      data: { qrCode: { short_code: 'abc123' } },
    })
    mocks.toDataURL.mockResolvedValue('data:image/png;base64,qr')
    const { result } = renderHook(() => useQrCreation(onCreated))

    act(() => {
      result.current.setTitle(' Event QR ')
      result.current.setDestination('https://example.com/events')
      result.current.handleQrModeChange('dynamic')
    })
    await act(() => result.current.handleGenerate({ preventDefault: vi.fn() }))

    expect(mocks.createQrCode).toHaveBeenCalledWith({
      title: 'Event QR',
      destination: 'https://example.com/events',
      qrType: 'dynamic',
    })
    expect(mocks.toDataURL).toHaveBeenCalledWith(
      expect.stringMatching(/\/r\/abc123$/),
      expect.objectContaining({ width: 280, errorCorrectionLevel: 'H' }),
    )
    expect(result.current.generatedQR).toBe('data:image/png;base64,qr')
    expect(result.current.generatedTitle).toBe('Event QR')
    expect(onCreated).toHaveBeenCalledOnce()
    expect(result.current.title).toBe('')
    expect(result.current.destination).toBe('')
  })

  it('creates static text QR codes without URL validation', async () => {
    mocks.createQrCode.mockResolvedValue({
      data: { qrCode: {} },
    })
    mocks.toDataURL.mockResolvedValue('data:image/png;base64,qr')
    const { result } = renderHook(() => useQrCreation(vi.fn()))

    act(() => {
      result.current.setTitle('Contact details')
      result.current.setDestination('Call us at 555-0100')
      result.current.setQrType('TEXT')
    })
    await act(() => result.current.handleGenerate({ preventDefault: vi.fn() }))

    expect(mocks.createQrCode).toHaveBeenCalledWith({
      title: 'Contact details',
      destination: 'Call us at 555-0100',
      qrType: 'static',
    })
    expect(mocks.toDataURL).toHaveBeenCalledWith(
      'Call us at 555-0100',
      expect.any(Object),
    )
  })

  it('rejects non-HTTP URL schemes before creating dynamic QR codes', async () => {
    const { result } = renderHook(() => useQrCreation(vi.fn()))

    act(() => {
      result.current.setTitle('Unsafe QR')
      result.current.setDestination('javascript:alert(1)')
      result.current.handleQrModeChange('dynamic')
    })
    await act(() => result.current.handleGenerate({ preventDefault: vi.fn() }))

    expect(result.current.error).toBe('Enter a valid URL, including https://')
    expect(mocks.createQrCode).not.toHaveBeenCalled()
  })

  it('ignores a second submit while a creation request is in flight', async () => {
    let resolveCreation
    mocks.createQrCode.mockReturnValue(
      new Promise((resolve) => {
        resolveCreation = resolve
      }),
    )
    mocks.toDataURL.mockResolvedValue('data:image/png;base64,qr')
    const { result } = renderHook(() => useQrCreation(vi.fn()))
    act(() => {
      result.current.setTitle('Event QR')
      result.current.setDestination('https://example.com/events')
    })

    let firstSubmission
    await act(async () => {
      firstSubmission = result.current.handleGenerate({
        preventDefault: vi.fn(),
      })
      await result.current.handleGenerate({ preventDefault: vi.fn() })

      expect(mocks.createQrCode).toHaveBeenCalledOnce()

      resolveCreation({ data: { qrCode: {} } })
      await firstSubmission
    })

    expect(mocks.createQrCode).toHaveBeenCalledOnce()
  })
})
