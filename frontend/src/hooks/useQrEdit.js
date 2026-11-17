import { useState } from 'react'
import { updateQrCode } from '../services/qr.service'

export default function useQrEdit(setQrCodes) {
  const [editingQr, setEditingQr] = useState(null)
  const [editTitle, setEditTitle] = useState('')
  const [editDestination, setEditDestination] = useState('')
  const [editError, setEditError] = useState('')
  const [isUpdating, setIsUpdating] = useState(false)

  const handleEditClick = (item) => {
    setEditingQr(item)
    setEditTitle(item.title)
    setEditDestination(item.destination)
    setEditError('')
  }

  const handleUpdateQr = async (event) => {
    event.preventDefault()
    setEditError('')

    const cleanTitle = editTitle.trim()
    const cleanDestination = editDestination.trim()

    if (!cleanTitle || !cleanDestination) {
      setEditError('Please enter both title and destination.')
      return
    }

    try {
      setIsUpdating(true)

      await updateQrCode(editingQr.id, {
        title: cleanTitle,
        destination: cleanDestination,
      })

      setQrCodes((previous) =>
        previous.map((item) =>
          item.id === editingQr.id
            ? {
                ...item,
                title: cleanTitle,
                destination: cleanDestination,
              }
            : item,
        ),
      )

      setEditingQr(null)
      setEditTitle('')
      setEditDestination('')
    } catch (requestError) {
      setEditError(
        requestError.message || 'Unable to update the QR code.',
      )
    } finally {
      setIsUpdating(false)
    }
  }

  return {
    editingQr,
    editTitle,
    editDestination,
    editError,
    isUpdating,
    setEditTitle,
    setEditDestination,
    closeEdit: () => setEditingQr(null),
    handleEditClick,
    handleUpdateQr,
  }
}
