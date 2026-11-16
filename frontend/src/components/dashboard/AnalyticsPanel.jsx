import PropTypes from 'prop-types'

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

  const maxDailyScans = Math.max(
    ...dailyScans.map((item) => Number(item.scans)),
    0,
  )
  const chartAxisMax = Math.max(4, Math.ceil(maxDailyScans / 4) * 4)
  const chartYAxisLabels = Array.from(
    { length: 5 },
    (_, index) => chartAxisMax - (index * chartAxisMax) / 4,
  )
  const chartPoints = dailyScans.map((item, index) => {
    const x = index * (600 / Math.max(dailyScans.length - 1, 1))
    const y = 190 - (Number(item.scans) / chartAxisMax) * 160

    return `${x},${y}`
  })
  const chartPolygonPoints = chartPoints.length
    ? `0,190 ${chartPoints.join(' ')} 600,190`
    : ''
  const chartLabelInterval = Math.max(
    1,
    Math.ceil(dailyScans.length / 7),
  )

  const renderBreakdown = (items, keyField, loadingMessage, emptyMessage) => {
    if (isLoadingAnalytics) {
      return <p>{loadingMessage}</p>
    }

    if (items.length === 0) {
      return <p>{emptyMessage}</p>
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
      <article className="panel analytics-panel" id="analytics">
        <div className="panel-heading">
          <div>
            <h3>Scan Analytics</h3>
            <p>Track how your QR codes perform over time.</p>
          </div>

          <div className="analytics-filters">
            <select
              className="period-select"
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
            </select>

            <select
              className="period-select"
              value={analyticsRange}
              onChange={(event) => onAnalyticsRangeChange(event.target.value)}
              aria-label="Analytics date range"
            >
              {Object.entries(analyticsRangeLabels).map(([range, label]) => (
                <option key={range} value={range}>{label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="chart-summary">
          <strong>
            {isLoadingAnalytics
              ? '...'
              : totalScans.toLocaleString('en-IN')}
          </strong>
          <span className="trend">
            {todayScans.toLocaleString('en-IN')} today
          </span>
          <small>scans in {selectedRangeLabel.toLowerCase()}</small>
        </div>

        <div className="chart">
          <div className="chart-y-labels">
            {chartYAxisLabels.map((value, index) => (
              <span key={index}>
                {Math.round(value).toLocaleString('en-IN')}
              </span>
            ))}
          </div>
          <div className="chart-plot">
            <div className="chart-grid-lines">
              <span></span><span></span><span></span><span></span><span></span>
            </div>
            <svg
              viewBox="0 0 600 190"
              preserveAspectRatio="none"
              role="img"
              aria-label="Daily QR code scan activity for the selected QR code"
            >
              <defs>
                <linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#8b5cf6" stopOpacity=".30" />
                  <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
                </linearGradient>
              </defs>
              <polygon points={chartPolygonPoints} fill="url(#chartFill)" />
              <polyline
                points={chartPoints.join(' ')}
                fill="none"
                stroke="#9b7bff"
                strokeWidth="3"
                vectorEffect="non-scaling-stroke"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <div className="chart-x-labels">
              {dailyScans.map((item, index) => {
                const isLast = index === dailyScans.length - 1

                if (index % chartLabelInterval !== 0 && !isLast) {
                  return null
                }

                const date = new Date(`${item.date}T00:00:00`)

                return (
                  <span key={item.date}>
                    {analyticsRange === '7d'
                      ? date.toLocaleDateString('en-IN', {
                          weekday: 'short',
                        })
                      : date.toLocaleDateString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                        })}
                  </span>
                )
              })}
            </div>
          </div>
        </div>
        <div className="chart-note">
          <span className="legend-dot"></span> QR code scans
          <span className="sample-note">
            {isLoadingAnalytics
              ? 'Loading analytics...'
              : analyticsError || 'Live analytics data'}
          </span>
        </div>
      </article>

      <section className="analytics-details">
        <article className="panel breakdown-panel">
          <div className="panel-heading">
            <div>
              <h3>Device Breakdown</h3>
              <p>Devices used to scan this QR code.</p>
            </div>
          </div>
          {renderBreakdown(
            deviceBreakdown,
            'device_type',
            'Loading device data...',
            'No device scan data available yet.',
          )}
        </article>

        <article className="panel breakdown-panel">
          <div className="panel-heading">
            <div>
              <h3>Browser Breakdown</h3>
              <p>Browsers used for QR scans.</p>
            </div>
          </div>
          {renderBreakdown(
            browserBreakdown,
            'browser',
            'Loading browser data...',
            'No browser scan data available yet.',
          )}
        </article>

        <article className="panel breakdown-panel">
          <div className="panel-heading">
            <div>
              <h3>Operating Systems</h3>
              <p>Operating systems used for QR scans.</p>
            </div>
          </div>
          {renderBreakdown(
            operatingSystemBreakdown,
            'operating_system',
            'Loading operating system data...',
            'No operating system data available yet.',
          )}
        </article>

        <article className="panel recent-scans-panel">
          <div className="panel-heading">
            <div>
              <h3>Recent Scan Activity</h3>
              <p>Latest 10 scans for the selected QR code.</p>
            </div>
          </div>

          {isLoadingAnalytics ? (
            <p>Loading recent scans...</p>
          ) : recentScans.length === 0 ? (
            <p>No scans recorded yet.</p>
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
        </article>
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
