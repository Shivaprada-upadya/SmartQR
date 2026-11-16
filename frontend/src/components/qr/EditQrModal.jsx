import { useEffect, useRef } from 'react'
import PropTypes from 'prop-types'

function EditQrModal({
  editingQr,
  editTitle,
  editDestination,
  editError,
  isUpdating,
  onEditTitleChange,
  onEditDestinationChange,
  onSubmit,
  onClose,
}) {
  const dialogRef = useRef(null)
  const onCloseRef = useRef(onClose)
  const isOpen = Boolean(editingQr)

  useEffect(() => {
    onCloseRef.current = onClose
  }, [onClose])

  useEffect(() => {
    if (!isOpen) return undefined

    const previouslyFocused = document.activeElement
    const dialog = dialogRef.current
    const focusableElements = dialog?.querySelectorAll(
      'button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])',
    )
    const firstFocusable = focusableElements?.[0]
    const lastFocusable = focusableElements?.[focusableElements.length - 1]

    dialog?.querySelector('#edit-title')?.focus()

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        onCloseRef.current()
        return
      }

      if (event.key !== 'Tab' || !dialog || !firstFocusable || !lastFocusable) {
        return
      }

      if (event.shiftKey && document.activeElement === firstFocusable) {
        event.preventDefault()
        lastFocusable.focus()
      } else if (
        !event.shiftKey &&
        document.activeElement === lastFocusable
      ) {
        event.preventDefault()
        firstFocusable.focus()
      } else if (!dialog.contains(document.activeElement)) {
        event.preventDefault()
        firstFocusable.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      if (
        previouslyFocused instanceof HTMLElement &&
        document.contains(previouslyFocused)
      ) {
        previouslyFocused.focus()
      }
    }
  }, [isOpen])

  if (!editingQr) return null

  return (
    <div className="edit-modal-overlay">
      <div
        ref={dialogRef}
        className="edit-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-modal-title"
        aria-describedby="edit-modal-description"
      >
        <div className="edit-modal-header">
          <div>
            <h3 id="edit-modal-title">Edit QR Code</h3>
            <p id="edit-modal-description">Update your QR code information.</p>
          </div>

          <button
            type="button"
            className="modal-close-button"
            onClick={onClose}
            aria-label="Close edit form"
          >
            ×
          </button>
        </div>

        <form onSubmit={onSubmit}>
          <div className="edit-form-group">
            <label htmlFor="edit-title">QR Code Title</label>
            <input
              id="edit-title"
              type="text"
              value={editTitle}
              onChange={(event) => onEditTitleChange(event.target.value)}
              maxLength={150}
              required
            />
          </div>

          <div className="edit-form-group">
            <label htmlFor="edit-destination">
              Destination / Content
            </label>
            <textarea
              id="edit-destination"
              value={editDestination}
              onChange={(event) =>
                onEditDestinationChange(event.target.value)
              }
              rows={4}
              maxLength={2048}
              required
            />
          </div>

          {editError && (
            <p className="form-error" role="alert">
              {editError}
            </p>
          )}

          <div className="edit-modal-actions">
            <button
              type="button"
              className="cancel-edit-button"
              onClick={onClose}
              disabled={isUpdating}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="primary-button"
              disabled={isUpdating}
            >
              {isUpdating ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

EditQrModal.propTypes = {
  editingQr: PropTypes.object,
  editTitle: PropTypes.string.isRequired,
  editDestination: PropTypes.string.isRequired,
  editError: PropTypes.string.isRequired,
  isUpdating: PropTypes.bool.isRequired,
  onEditTitleChange: PropTypes.func.isRequired,
  onEditDestinationChange: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
}

export default EditQrModal
