import PropTypes from 'prop-types'
import { EmptyState, LoadingSpinner } from '../ui'

function ScanTrendChart({
  dailyScans,
  analyticsRange,
  isLoading,
  error,
}) {
  const formatChartDate = (value) => {
    if (!value) return null

    const dateOnly = String(value).slice(0, 10)
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateOnly)) return null

    const date = new Date(`${dateOnly}T00:00:00`)
    if (Number.isNaN(date.getTime())) return null

    return analyticsRange === '7d'
      ? date.toLocaleDateString('en-IN', { weekday: 'short' })
      : date.toLocaleDateString('en-IN', {
          day: '2-digit',
          month: 'short',
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
  const chartLabelInterval = Math.max(1, Math.ceil(dailyScans.length / 7))

  return (
    <div className="analytics-chart-card">
      <div className="analytics-chart-heading">
        <div>
          <h4>Scan activity</h4>
          <p>Daily scans for the selected QR code</p>
        </div>
        <span className="analytics-chart-legend">
          <span aria-hidden="true" />
          Scans
        </span>
      </div>

      {isLoading ? (
        <div className="analytics-chart-state">
          <LoadingSpinner label="Loading scan activity..." showLabel />
        </div>
      ) : error ? (
        <p className="analytics-chart-state analytics-chart-error" role="alert">
          {error}
        </p>
      ) : dailyScans.length === 0 ? (
        <EmptyState
          className="analytics-chart-state"
          title="No scan activity yet"
          description="Scans will appear here after the QR code is used."
        />
      ) : (
        <div className="chart">
          <div className="chart-y-labels" aria-hidden="true">
            {chartYAxisLabels.map((value, index) => (
              <span key={index}>
                {Math.round(value).toLocaleString('en-IN')}
              </span>
            ))}
          </div>
          <div className="chart-plot">
            <div className="chart-grid-lines" aria-hidden="true">
              <span /><span /><span /><span /><span />
            </div>
            <svg
              viewBox="0 0 600 190"
              preserveAspectRatio="none"
              role="img"
              aria-label="Daily QR code scan activity"
            >
              <polygon
                points={chartPolygonPoints}
                fill="var(--color-brand-surface-subtle)"
              />
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
            <div className="chart-x-labels" aria-hidden="true">
              {dailyScans.map((item, index) => {
                const isLast = index === dailyScans.length - 1
                if (index % chartLabelInterval !== 0 && !isLast) return null
                const label = formatChartDate(item.date)
                if (!label) return null
                return (
                  <span key={item.date}>
                    {label}
                  </span>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

ScanTrendChart.propTypes = {
  dailyScans: PropTypes.arrayOf(PropTypes.shape({
    date: PropTypes.string.isRequired,
    scans: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  })).isRequired,
  analyticsRange: PropTypes.oneOf(['7d', '30d', '90d', 'all']).isRequired,
  isLoading: PropTypes.bool.isRequired,
  error: PropTypes.string.isRequired,
}

export default ScanTrendChart
