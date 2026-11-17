import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import DashboardHeader from './DashboardHeader'

afterEach(cleanup)

describe('DashboardHeader', () => {
  it('shows the active page context and triggers create navigation', async () => {
    const user = userEvent.setup()
    const onCreateQr = vi.fn()
    render(
      <DashboardHeader
        activeNav="Analytics"
        user={{ name: 'Jordan Lee', email: 'jordan@example.com' }}
        userInitials="JL"
        onCreateQr={onCreateQr}
      />,
    )

    expect(screen.getByRole('heading', { name: 'Analytics' })).toBeTruthy()
    expect(
      screen.getByText('Explore scan activity and audience insights.'),
    ).toBeTruthy()
    expect(screen.getByText('Jordan Lee')).toBeTruthy()

    await user.click(screen.getByRole('button', { name: 'Create QR code' }))
    expect(onCreateQr).toHaveBeenCalledOnce()
  })

  it('updates account and page details when the active user changes', () => {
    const firstUser = { name: 'Jordan Lee', email: 'jordan@example.com' }
    const nextUser = { name: 'Taylor Kim', email: 'taylor@example.com' }
    const { rerender } = render(
      <DashboardHeader
        activeNav="Overview"
        user={firstUser}
        userInitials="JL"
        onCreateQr={vi.fn()}
      />,
    )

    rerender(
      <DashboardHeader
        activeNav="My QR Codes"
        user={nextUser}
        userInitials="TK"
        onCreateQr={vi.fn()}
      />,
    )

    expect(screen.getByRole('heading', { name: 'My QR codes' })).toBeTruthy()
    expect(screen.getByText('Taylor Kim')).toBeTruthy()
    expect(screen.getByText('Search, filter, and manage your QR codes.')).toBeTruthy()
  })
})
