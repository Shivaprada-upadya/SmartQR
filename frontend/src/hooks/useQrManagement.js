import { useState } from 'react'
import { bulkManageQrCodes, deleteQrCode } from '../services/qr.service'

export default function useQrManagement({
  qrCodes,
  selectedQrIds,
  setSelectedQrIds,
  selectedAnalyticsQr,
  setSelectedAnalyticsQr,
  currentPage,
  setCurrentPage,
  refreshQrCodes,
  refreshOverview,
  setQrListError,
}) {
  const [isBulkManaging, setIsBulkManaging] = useState(false)
  const [bulkActionError, setBulkActionError] = useState('')
  const [bulkActionMessage, setBulkActionMessage] = useState('')
  const [deleteConfirmation, setDeleteConfirmation] = useState(null)
  const [deleteConfirmationError, setDeleteConfirmationError] = useState('')
  const [isDeletingQr, setIsDeletingQr] = useState(false)

  const clearBulkActionFeedback = () => {
    setBulkActionError('')
    setBulkActionMessage('')
  }

  const handleDeleteQr = (id) => {
    const qrCode = qrCodes.find((item) => String(item.id) === String(id))

    setDeleteConfirmationError('')
    setDeleteConfirmation({ type: 'single', id, title: qrCode?.title })
  }

  const handleConfirmDelete = async () => {
    if (!deleteConfirmation || isDeletingQr || isBulkManaging) return

    setDeleteConfirmationError('')
    setIsDeletingQr(true)

    if (deleteConfirmation.type === 'single') {
      const { id } = deleteConfirmation

      try {
        await deleteQrCode(id)
        refreshOverview()
        setSelectedQrIds((current) =>
          current.filter((selectedId) => selectedId !== String(id)),
        )

        if (String(selectedAnalyticsQr) === String(id)) {
          setSelectedAnalyticsQr('')
        }

        if (currentPage > 1 && qrCodes.length === 1) {
          setCurrentPage((page) => page - 1)
        } else {
          refreshQrCodes()
        }

        setDeleteConfirmation(null)
      } catch (requestError) {
        const message = requestError.message || 'Unable to delete the QR code.'
        setDeleteConfirmationError(message)
        setQrListError(message)
      } finally {
        setIsDeletingQr(false)
      }

      return
    }

    const ids = deleteConfirmation.ids
    clearBulkActionFeedback()
    setIsBulkManaging(true)

    try {
      const response = await bulkManageQrCodes({ ids, action: 'delete' })

      if (ids.includes(String(selectedAnalyticsQr))) {
        setSelectedAnalyticsQr('')
      }

      setSelectedQrIds([])
      setCurrentPage(1)
      refreshQrCodes()
      refreshOverview()
      setBulkActionMessage(response.message)
      setDeleteConfirmation(null)
    } catch (requestError) {
      const message =
        requestError.message || 'Unable to apply the bulk action.'
      setDeleteConfirmationError(message)
      setBulkActionError(message)
    } finally {
      setIsDeletingQr(false)
      setIsBulkManaging(false)
    }
  }

  const handleBulkAction = async (action) => {
    const ids = selectedQrIds

    if (ids.length === 0 || isBulkManaging) return

    if (action === 'delete') {
      setDeleteConfirmationError('')
      setDeleteConfirmation({ type: 'bulk', ids })
      return
    }

    clearBulkActionFeedback()
    setIsBulkManaging(true)

    try {
      const response = await bulkManageQrCodes({ ids, action })

      setSelectedQrIds([])
      setCurrentPage(1)
      refreshQrCodes()
      refreshOverview()
      setBulkActionMessage(response.message)
    } catch (requestError) {
      setBulkActionError(
        requestError.message || 'Unable to apply the bulk action.',
      )
    } finally {
      setIsBulkManaging(false)
    }
  }

  const closeDeleteConfirmation = () => {
    if (isDeletingQr || isBulkManaging) return
    setDeleteConfirmation(null)
    setDeleteConfirmationError('')
  }

  return {
    isBulkManaging,
    bulkActionError,
    bulkActionMessage,
    deleteConfirmation,
    deleteConfirmationError,
    isDeletingQr,
    clearBulkActionFeedback,
    handleDeleteQr,
    handleConfirmDelete,
    handleBulkAction,
    closeDeleteConfirmation,
  }
}
