import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import AnalyticsPanel from './AnalyticsPanel'

afterEach(cleanup)

describe('AnalyticsPanel', () => {
  it('renders the analytics summary, filters, chart, and breakdown data', async () => {
    const user = userEvent.setup()
    const onAnalyticsQrChange = vi.fn()
    const onAnalyticsRangeChange = vi.fn()
    render(
      <AnalyticsPanel
        analytics={{
          summary: { total_scans: 24 },
          dailyScans: [
            { date: '2026-11-19T00:00:00.000Z', scans: 8 },
            { date: '2026-11-20T00:00:00.000Z', scans: 16 },
          ],
          deviceBreakdown: [{ device_type: 'Mobile', scans: 18 }],
          browserBreakdown: [{ browser: 'Chrome', scans: 20 }],
          operatingSystemBreakdown: [{ operating_system: 'Android', scans: 16 }],
          recentScans: [{
            id: 'scan-1',
            device_type: 'Mobile',
            browser: 'Chrome',
            operating_system: 'Android',
            referrer: 'https://example.com',
            scanned_at: '2026-11-20T12:30:00.000Z',
          }],
        }}
        qrCodes={[
          { id: 'qr-1', title: 'Event QR' },
          { id: 'qr-2', title: 'Website QR' },
        ]}
        selectedAnalyticsQr="qr-1"
        analyticsRange="7d"
        isLoadingAnalytics={false}
        analyticsError=""
        totalScans={24}
        todayScans={5}
        selectedRangeLabel="Last 7 days"
        onAnalyticsQrChange={onAnalyticsQrChange}
        onAnalyticsRangeChange={onAnalyticsRangeChange}
      />,
    )

    expect(screen.getByRole('heading', { name: 'Analytics' })).toBeTruthy()
    expect(screen.getByText('24')).toBeTruthy()
    expect(screen.getByText('Scan activity')).toBeTruthy()
    expect(screen.getAllByText('Mobile').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Chrome').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Android').length).toBeGreaterThan(0)
    expect(screen.queryByText('Invalid Date')).toBeNull()

    await user.selectOptions(screen.getByLabelText('QR code'), 'qr-2')
    await user.selectOptions(screen.getByLabelText('Date range'), '30d')

    expect(onAnalyticsQrChange).toHaveBeenCalledWith('qr-2')
    expect(onAnalyticsRangeChange).toHaveBeenCalledWith('30d')
  })

  it('shows loading and error states without misleading chart data', () => {
    const { rerender } = render(
      <AnalyticsPanel
        analytics={null}
        qrCodes={[]}
        selectedAnalyticsQr=""
        analyticsRange="7d"
        isLoadingAnalytics={true}
        analyticsError=""
        totalScans={0}
        todayScans={0}
        selectedRangeLabel="Last 7 days"
        onAnalyticsQrChange={vi.fn()}
        onAnalyticsRangeChange={vi.fn()}
      />,
    )

    expect(screen.getAllByText('Loading scan activity...').length).toBeGreaterThan(
      0,
    )

    rerender(
      <AnalyticsPanel
        analytics={null}
        qrCodes={[]}
        selectedAnalyticsQr=""
        analyticsRange="7d"
        isLoadingAnalytics={false}
        analyticsError="Analytics unavailable"
        totalScans={0}
        todayScans={0}
        selectedRangeLabel="Last 7 days"
        onAnalyticsQrChange={vi.fn()}
        onAnalyticsRangeChange={vi.fn()}
      />,
    )

    expect(screen.getByRole('alert').textContent).toBe('Analytics unavailable')
  })
})
