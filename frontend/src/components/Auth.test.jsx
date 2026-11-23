import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import Auth from './Auth'

const mocks = vi.hoisted(() => ({
  login: vi.fn(),
  registerAccount: vi.fn(),
}))

vi.mock('../services/auth.service', () => ({
  login: mocks.login,
  registerAccount: mocks.registerAccount,
}))

beforeEach(() => {
  mocks.login.mockReset()
  mocks.registerAccount.mockReset()
})

afterEach(cleanup)

describe('Auth', () => {
  it('submits login credentials and completes authentication', async () => {
    const user = userEvent.setup()
    const onAuthenticated = vi.fn()
    const account = { id: 'user-1', name: 'Jordan Lee' }
    mocks.login.mockResolvedValue(account)
    render(<Auth onAuthenticated={onAuthenticated} />)

    await user.type(screen.getByLabelText(/Email address/), ' jordan@example.com ')
    await user.type(screen.getByLabelText(/Password/), 'secret123')
    await user.click(screen.getByRole('button', { name: 'Sign in' }))

    expect(mocks.login).toHaveBeenCalledWith({
      email: 'jordan@example.com',
      password: 'secret123',
    })
    expect(onAuthenticated).toHaveBeenCalledWith(account)
  })

  it('registers with trimmed fields before logging in', async () => {
    const user = userEvent.setup()
    mocks.registerAccount.mockResolvedValue({})
    mocks.login.mockResolvedValue({ id: 'user-2', name: 'Taylor Kim' })
    render(<Auth onAuthenticated={vi.fn()} />)

    await user.click(screen.getByRole('button', { name: 'Create account' }))
    await user.type(screen.getByLabelText(/Full name/), ' Taylor Kim ')
    await user.type(screen.getByLabelText(/Email address/), ' taylor@example.com ')
    await user.type(screen.getByLabelText(/Password/), 'password123')
    await user.click(screen.getByRole('button', { name: 'Create account' }))

    expect(mocks.registerAccount).toHaveBeenCalledWith({
      name: 'Taylor Kim',
      email: 'taylor@example.com',
      password: 'password123',
    })
    expect(mocks.login).toHaveBeenCalledOnce()
  })

  it('shows API errors and allows switching back to login', async () => {
    const user = userEvent.setup()
    mocks.login.mockRejectedValue(new Error('Invalid email or password'))
    render(<Auth onAuthenticated={vi.fn()} />)

    await user.type(screen.getByLabelText(/Email address/), 'bad@example.com')
    await user.type(screen.getByLabelText(/Password/), 'wrong')
    await user.click(screen.getByRole('button', { name: 'Sign in' }))

    expect((await screen.findByRole('alert')).textContent).toContain(
      'Invalid email or password',
    )

    await user.click(screen.getByRole('button', { name: 'Create account' }))
    expect(screen.getByRole('heading', { name: 'Create your account' })).toBeTruthy()
  })

  it('prevents duplicate submits while authentication is in flight', async () => {
    const user = userEvent.setup()
    let resolveLogin
    mocks.login.mockReturnValue(
      new Promise((resolve) => {
        resolveLogin = resolve
      }),
    )
    render(<Auth onAuthenticated={vi.fn()} />)

    await user.type(screen.getByLabelText(/Email address/), 'user@example.com')
    await user.type(screen.getByLabelText(/Password/), 'secret')

    await user.dblClick(screen.getByRole('button', { name: 'Sign in' }))

    expect(mocks.login).toHaveBeenCalledOnce()

    resolveLogin({ id: 'user-1', name: 'User' })
  })
})
