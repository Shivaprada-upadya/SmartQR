import { useState } from 'react'
import QRCode from 'qrcode'

const getSafeFilename = (title) => {
  const filename = title
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

  return filename || 'smartqr-code'
}

function getQrExportContent(qr) {
  if (qr.type !== 'DYNAMIC') {
    return qr.destination
  }

  if (!qr.short_code) {
    throw new Error('Dynamic QR code is missing its short code.')
  }

  const apiBaseUrl =
    import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'

  return new URL(`/r/${qr.short_code}`, apiBaseUrl).toString()
}

export default function useQrExport() {
  const [qrExportSize, setQrExportSize] = useState('512')
  const [exportError, setExportError] = useState('')

  const downloadQr = async (content, qrTitle, format) => {
    setExportError('')

    try {
      const options = {
        width: Number(qrExportSize),
        margin: 2,
        errorCorrectionLevel: 'H',
        color: {
          dark: '#111827',
          light: '#ffffff',
        },
      }

      let downloadUrl

      if (format === 'svg') {
        const svg = await QRCode.toString(content, {
          ...options,
          type: 'svg',
        })

        const blob = new Blob([svg], {
          type: 'image/svg+xml;charset=utf-8',
        })

        downloadUrl = URL.createObjectURL(blob)
      } else {
        downloadUrl = await QRCode.toDataURL(content, options)
      }

      const link = document.createElement('a')
      link.href = downloadUrl
      link.download = `${getSafeFilename(qrTitle)}.${format}`

      document.body.appendChild(link)
      link.click()
      link.remove()

      if (format === 'svg') {
        URL.revokeObjectURL(downloadUrl)
      }
    } catch {
      setExportError(`Unable to export the QR code as ${format.toUpperCase()}.`)
    }
  }

  const downloadListQr = (qr, format) => {
    downloadQr(getQrExportContent(qr), qr.title, format)
  }

  return {
    qrExportSize,
    setQrExportSize,
    exportError,
    setExportError,
    downloadQr,
    downloadListQr,
  }
}
