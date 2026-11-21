import PropTypes from 'prop-types'
import { Badge, Card, EmptyState, LoadingSpinner, SectionHeading, Select } from '../ui'
import ScanTrendChart from './ScanTrendChart'

const analyticsRangeLabels = {
  '7d': 'Last 7 days',
  '30d': 'Last 30 days',
  '90d': 'Last 90 days',
  all: 'All time',
}

function AnalyticsPanel({
  analytics,
  qrCodes,
  selectedAnalyticsQr,
  analyticsRange,
  isLoadingAnalytics,
  analyticsError,
  totalScans,
  todayScans,
  selectedRangeLabel,
  onAnalyticsQrChange,
  onAnalyticsRangeChange,
}) {
  const dailyScans = analytics?.dailyScans ?? []
  const deviceBreakdown = analytics?.deviceBreakdown ?? []
  const browserBreakdown = analytics?.browserBreakdown ?? []
  const operatingSystemBreakdown =
    analytics?.operatingSystemBreakdown ?? []
  const recentScans = analytics?.recentScans ?? []

  const getBreakdownPercentage = (scans) => {
    const total = Number(analytics?.summary?.total_scans ?? 0)

    return total > 0
      ? Math.round((Number(scans) / total) * 100)
      : 0
  }

  const formatScanDate = (date) => {
    if (!date) return 'Unknown date'

    return new Date(date).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const renderBreakdown = (items, keyField, loadingMessage, emptyMessage) => {
    if (isLoadingAnalytics) {
      return (
        <div className="analytics-breakdown-state">
          <LoadingSpinner label={loadingMessage} showLabel />
        </div>
      )
    }

    if (items.length === 0) {
      return <p className="analytics-breakdown-empty">{emptyMessage}</p>
    }

    return items.map((item) => {
      const percentage = getBreakdownPercentage(item.scans)

      return (
        <div className="breakdown-item" key={item[keyField]}>
          <div className="breakdown-label">
            <span>{item[keyField] || 'Unknown'}</span>
            <strong>{Number(item.scans).toLocaleString('en-IN')}</strong>
          </div>
          <div className="breakdown-track">
            <div
              className="breakdown-fill"
              style={{ width: `${percentage}%` }}
            />
          </div>
          <small>{percentage}%</small>
        </div>
      )
    })
  }

  return (
    <>
      <Card as="article" className="panel analytics-panel" id="analytics">
        <SectionHeading
          className="analytics-heading"
          title="Analytics"
          description="Understand scan performance and audience activity."
          level={3}
          actions={(
            <div className="analytics-filters">
              <Select
                className="analytics-filter"
                label="QR code"
                value={selectedAnalyticsQr || ''}
                onChange={(event) => onAnalyticsQrChange(event.target.value)}
                disabled={qrCodes.length === 0}
                aria-label="Select QR code"
              >
                {qrCodes.length === 0 ? (
                  <option value="">No QR codes available</option>
                ) : (
                  qrCodes.map((qr) => (
                    <option key={qr.id} value={String(qr.id)}>
                      {qr.title}
                    </option>
                  ))
                )}
              </Select>

              <Select
                className="analytics-filter"
                label="Date range"
                value={analyticsRange}
                onChange={(event) => onAnalyticsRangeChange(event.target.value)}
                aria-label="Analytics date range"
              >
                {Object.entries(analyticsRangeLabels).map(([range, label]) => (
                  <option key={range} value={range}>{label}</option>
                ))}
              </Select>
            </div>
          )}
        />

        <div className="analytics-summary-grid" aria-label="Scan summary">
          <div className="analytics-summary-card">
            <span>Total scans</span>
            <strong>{isLoadingAnalytics ? '...' : totalScans.toLocaleString('en-IN')}</strong>
            <small>{selectedRangeLabel}</small>
          </div>
          <div className="analytics-summary-card">
            <span>Scans today</span>
            <strong>{todayScans.toLocaleString('en-IN')}</strong>
            <small>Daily activity</small>
          </div>
          <div className="analytics-summary-card analytics-summary-status">
            <span>Status</span>
            <Badge variant={analyticsError ? 'danger' : 'success'}>
              {isLoadingAnalytics ? 'Loading' : analyticsError ? 'Unavailable' : 'Live'}
            </Badge>
            <small>{analyticsError || 'Updated from scan activity'}</small>
          </div>
        </div>

        <ScanTrendChart
          dailyScans={dailyScans}
          analyticsRange={analyticsRange}
          isLoading={isLoadingAnalytics}
          error={analyticsError}
        />
      </Card>

      <section className="analytics-details">
        <Card as="article" className="panel breakdown-panel" padding="sm">
          <SectionHeading
            className="panel-heading"
            title="Device Breakdown"
            description="Devices used to scan this QR code."
            level={3}
          />
          {renderBreakdown(
            deviceBreakdown,
            'device_type',
            'Loading device data...',
            'No device scan data available yet.',
          )}
        </Card>

        <Card as="article" className="panel breakdown-panel" padding="sm">
          <SectionHeading
            className="panel-heading"
            title="Browser Breakdown"
            description="Browsers used for QR scans."
            level={3}
          />
          {renderBreakdown(
            browserBreakdown,
            'browser',
            'Loading browser data...',
            'No browser scan data available yet.',
          )}
        </Card>

        <Card as="article" className="panel breakdown-panel" padding="sm">
          <SectionHeading
            className="panel-heading"
            title="Operating Systems"
            description="Operating systems used for QR scans."
            level={3}
          />
          {renderBreakdown(
            operatingSystemBreakdown,
            'operating_system',
            'Loading operating system data...',
            'No operating system data available yet.',
          )}
        </Card>

        <Card as="article" className="panel recent-scans-panel">
          <SectionHeading
            className="panel-heading"
            title="Recent Scan Activity"
            description="Latest 10 scans for the selected QR code."
            level={3}
          />

          {isLoadingAnalytics ? (
            <p>Loading recent scans...</p>
          ) : recentScans.length === 0 ? (
            <EmptyState title="No scans recorded yet." />
          ) : (
            <div className="recent-scans-list">
              {recentScans.map((scan) => (
                <div className="recent-scan-item" key={scan.id}>
                  <div>
                    <strong>{scan.device_type || 'Unknown device'}</strong>
                    <span>
                      {scan.browser || 'Unknown browser'} ·{' '}
                      {scan.operating_system || 'Unknown OS'}
                    </span>
                    <small>
                      Referrer: {scan.referrer || 'Direct / Unknown'}
                    </small>
                  </div>
                  <time dateTime={scan.scanned_at}>
                    {formatScanDate(scan.scanned_at)}
                  </time>
                </div>
              ))}
            </div>
          )}
        </Card>
      </section>
    </>
  )
}

AnalyticsPanel.propTypes = {
  analytics: PropTypes.object,
  qrCodes: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
    title: PropTypes.string.isRequired,
  })).isRequired,
  selectedAnalyticsQr: PropTypes.oneOfType([
    PropTypes.number,
    PropTypes.string,
  ]),
  analyticsRange: PropTypes.oneOf(['7d', '30d', '90d', 'all']).isRequired,
  isLoadingAnalytics: PropTypes.bool.isRequired,
  analyticsError: PropTypes.string.isRequired,
  totalScans: PropTypes.number.isRequired,
  todayScans: PropTypes.number.isRequired,
  selectedRangeLabel: PropTypes.string.isRequired,
  onAnalyticsQrChange: PropTypes.func.isRequired,
  onAnalyticsRangeChange: PropTypes.func.isRequired,
}

export default AnalyticsPanel
