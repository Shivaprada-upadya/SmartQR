import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  Badge,
  Button,
  Card,
  EmptyState,
  Input,
  LoadingSpinner,
  SectionHeading,
  Select,
} from './index'

afterEach(cleanup)

describe('UI primitives', () => {
  it('provides consistent button variants and loading accessibility', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()
    render(
      <>
        <Button variant="secondary" onClick={onClick}>Save</Button>
        <Button isLoading loadingLabel="Saving changes">Save</Button>
      </>,
    )

    await user.click(screen.getByRole('button', { name: 'Save' }))

    expect(onClick).toHaveBeenCalledOnce()
    const loadingButton = screen.getAllByRole('button')[1]
    expect(loadingButton.disabled).toBe(true)
    expect(loadingButton.getAttribute('aria-busy')).toBe('true')
    expect(screen.getByRole('status').textContent).toContain('Saving changes')
  })

  it('connects field labels and validation messages accessibly', () => {
    render(
      <>
        <Input
          id="email"
          label="Email address"
          type="email"
          error="Enter a valid email address."
        />
        <Select id="range" label="Date range" defaultValue="7d">
          <option value="7d">Last 7 days</option>
        </Select>
      </>,
    )

    expect(
      screen.getByLabelText('Email address').getAttribute('aria-invalid'),
    ).toBe('true')
    expect(screen.getByRole('alert').textContent).toContain(
      'Enter a valid email address.',
    )
    expect(screen.getByLabelText('Date range').value).toBe('7d')
  })

  it('renders semantic cards, headings, and badge variants', () => {
    render(
      <Card as="section" aria-label="QR summary">
        <SectionHeading
          title="QR summary"
          description="Account overview"
          level={2}
        />
        <Badge variant="success">Active</Badge>
      </Card>,
    )

    expect(screen.getByRole('region', { name: 'QR summary' })).toBeTruthy()
    expect(screen.getByRole('heading', { name: 'QR summary', level: 2 })).toBeTruthy()
    expect(screen.getByText('Active').className).toContain('ui-badge--success')
  })

  it('announces loading and provides structured empty states', () => {
    render(
      <>
        <LoadingSpinner label="Loading analytics" showLabel />
        <EmptyState
          title="No scan data"
          description="Scans will appear here."
        />
      </>,
    )

    expect(screen.getByRole('status').textContent).toContain('Loading analytics')
    expect(screen.getByRole('heading', { name: 'No scan data' })).toBeTruthy()
    expect(screen.getByText('Scans will appear here.')).toBeTruthy()
  })
})
