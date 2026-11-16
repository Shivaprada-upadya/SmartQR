import { useState } from 'react'
import QRCode from 'qrcode'
import { createQrCode } from '../services/qr.service'

export default function useQrCreation(onCreated) {
  const [title, setTitle] = useState('')
  const [destination, setDestination] = useState('')
  const [qrType, setQrType] = useState('URL')
  const [qrMode, setQrMode] = useState('static')
  const [generatedQR, setGeneratedQR] = useState('')
  const [generatedTitle, setGeneratedTitle] = useState('')
  const [generatedQRContent, setGeneratedQRContent] = useState('')
  const [error, setError] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)

  const handleQrModeChange = (mode) => {
    setQrMode(mode)

    if (mode === 'dynamic') {
      setQrType('URL')
    }
  }

  const handleGenerate = async (event) => {
    event.preventDefault()
    setError('')
    setGeneratedQR('')

    const cleanTitle = title.trim()
    const cleanDestination = destination.trim()

    if (!cleanTitle || !cleanDestination) {
      setError('Please enter both a QR title and content.')
      return
    }

    if (qrType === 'URL' || qrMode === 'dynamic') {
      try {
        const parsedUrl = new URL(cleanDestination)

        if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
          throw new Error('Invalid protocol')
        }
      } catch {
        setError('Enter a valid URL, including https://')
        return
      }
    }

    try {
      setIsGenerating(true)

      const response = await createQrCode({
        title: cleanTitle,
        destination: cleanDestination,
        qrType: qrMode,
      })

      const savedQr = response.data.qrCode

      if (qrMode === 'dynamic' && !savedQr.short_code) {
        throw new Error('Dynamic QR code was created without a short code.')
      }

      const apiBaseUrl =
        import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'
      const qrContent =
        qrMode === 'dynamic'
          ? new URL(`/r/${savedQr.short_code}`, apiBaseUrl).toString()
          : cleanDestination
      const image = await QRCode.toDataURL(qrContent, {
        width: 280,
        margin: 2,
        errorCorrectionLevel: 'H',
        color: {
          dark: '#111827',
          light: '#ffffff',
        },
      })

      setGeneratedQR(image)
      setGeneratedTitle(cleanTitle)
      setGeneratedQRContent(qrContent)
      onCreated()
      setTitle('')
      setDestination('')
    } catch (requestError) {
      setError(requestError.message || 'Unable to create the QR code.')
    } finally {
      setIsGenerating(false)
    }
  }

  return {
    title,
    setTitle,
    destination,
    setDestination,
    qrType,
    setQrType,
    qrMode,
    handleQrModeChange,
    generatedQR,
    generatedTitle,
    generatedQRContent,
    error,
    isGenerating,
    handleGenerate,
  }
}
