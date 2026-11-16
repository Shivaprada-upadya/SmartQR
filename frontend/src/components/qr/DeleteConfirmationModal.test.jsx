import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import DeleteConfirmationModal from './DeleteConfirmationModal'

afterEach(cleanup)

function renderDeleteConfirmation(overrides = {}) {
  const props = {
    confirmation: { type: 'bulk', ids: ['qr-1', 'qr-2'] },
    error: '',
    isDeleting: false,
    onConfirm: vi.fn(),
    onClose: vi.fn(),
    ...overrides,
  }

  return { ...render(<DeleteConfirmationModal {...props} />), props }
}

describe('DeleteConfirmationModal', () => {
  it('describes the bulk deletion and closes on Escape', async () => {
    const user = userEvent.setup()
    const { props } = renderDeleteConfirmation()

    expect(screen.getByRole('dialog', {
      name: 'Delete selected QR codes?',
    })).toBeTruthy()
    expect(screen.getByText(
      'Delete 2 selected QR codes? This cannot be undone.',
    )).toBeTruthy()
    expect(document.activeElement).toBe(screen.getByRole('button', {
      name: 'Cancel',
    }))

    await user.keyboard('{Escape}')

    expect(props.onClose).toHaveBeenCalledOnce()
  })

  it('confirms deletion of a named QR code', async () => {
    const user = userEvent.setup()
    const { props } = renderDeleteConfirmation({
      confirmation: { type: 'single', id: 'qr-1', title: 'Event QR' },
    })

    expect(screen.getByText(
      'Delete "Event QR"? This cannot be undone.',
    )).toBeTruthy()
    await user.click(screen.getByRole('button', { name: 'Delete' }))

    expect(props.onConfirm).toHaveBeenCalledOnce()
  })
})
