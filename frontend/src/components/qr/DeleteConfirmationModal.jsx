import { useEffect, useRef } from 'react'
import PropTypes from 'prop-types'
import { Button } from '../ui'

function DeleteConfirmationModal({
  confirmation,
  error,
  isDeleting,
  onConfirm,
  onClose,
}) {
  const dialogRef = useRef(null)
  const onCloseRef = useRef(onClose)

  useEffect(() => {
    onCloseRef.current = onClose
  }, [onClose])

  useEffect(() => {
    if (!confirmation) return undefined

    const previouslyFocused = document.activeElement
    const dialog = dialogRef.current
    const focusableElements = dialog?.querySelectorAll(
      'button:not([disabled]), [tabindex]:not([tabindex="-1"])',
    )
    const firstFocusable = focusableElements?.[0]
    const lastFocusable = focusableElements?.[focusableElements.length - 1]

    firstFocusable?.focus()

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
  }, [confirmation])

  if (!confirmation) return null

  const isBulkDelete = confirmation.type === 'bulk'
  const count = confirmation.ids?.length ?? 0
  const description = isBulkDelete
    ? `Delete ${count} selected QR code${count === 1 ? '' : 's'}? This cannot be undone.`
    : confirmation.title
      ? `Delete "${confirmation.title}"? This cannot be undone.`
      : 'Delete this QR code? This cannot be undone.'

  return (
    <div className="edit-modal-overlay">
      <div
        ref={dialogRef}
        className="edit-modal"
        role="dialog"
        aria-modal="true"
        aria-busy={isDeleting}
        aria-labelledby="delete-modal-title"
        aria-describedby="delete-modal-description"
      >
        <div className="edit-modal-header">
          <div>
            <h3 id="delete-modal-title">
              {isBulkDelete ? 'Delete selected QR codes?' : 'Delete QR code?'}
            </h3>
            <p id="delete-modal-description">{description}</p>
          </div>
        </div>

        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}

        <div className="edit-modal-actions">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="danger"
            size="sm"
            onClick={onConfirm}
            disabled={isDeleting}
            isLoading={isDeleting}
            loadingLabel="Deleting QR code"
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </Button>
        </div>
      </div>
    </div>
  )
}

DeleteConfirmationModal.propTypes = {
  confirmation: PropTypes.shape({
    type: PropTypes.oneOf(['single', 'bulk']).isRequired,
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    ids: PropTypes.arrayOf(PropTypes.string),
    title: PropTypes.string,
  }),
  error: PropTypes.string.isRequired,
  isDeleting: PropTypes.bool.isRequired,
  onConfirm: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
}

export default DeleteConfirmationModal
