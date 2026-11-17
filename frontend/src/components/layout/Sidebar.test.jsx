import { cleanup, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import Sidebar from './Sidebar'

afterEach(cleanup)

describe('Sidebar navigation', () => {
  it('marks the active destination and preserves section targets', async () => {
    const user = userEvent.setup()
    const onNavigate = vi.fn()
    render(
      <Sidebar
        user={{ name: 'Jordan Lee', email: 'jordan@example.com' }}
        userInitials="JL"
        activeNav="Overview"
        onNavigate={onNavigate}
        onLogout={vi.fn()}
      />,
    )
    const navigation = within(
      screen.getByRole('navigation', { name: 'Main navigation' }),
    )

    expect(navigation.getByRole('button', { name: 'Overview' }).getAttribute(
      'aria-current',
    )).toBe('page')
    const destinations = [
      ['Overview', 'overview'],
      ['Create QR', 'create'],
      ['My QR Codes', 'recent'],
      ['Analytics', 'analytics'],
    ]

    for (const [label] of destinations) {
      await user.click(navigation.getByRole('button', { name: label }))
    }

    expect(onNavigate.mock.calls).toEqual(
      destinations.map(([label, target]) => [target, label]),
    )
  })

  it('displays the signed-in user and invokes logout', async () => {
    const user = userEvent.setup()
    const onLogout = vi.fn()
    render(
      <Sidebar
        user={{ name: 'Jordan Lee', email: 'jordan@example.com' }}
        userInitials="JL"
        activeNav="Overview"
        onNavigate={vi.fn()}
        onLogout={onLogout}
      />,
    )

    expect(screen.getByText('jordan@example.com')).toBeTruthy()
    await user.click(screen.getByRole('button', { name: 'Sign out' }))

    expect(onLogout).toHaveBeenCalledOnce()
  })
})
