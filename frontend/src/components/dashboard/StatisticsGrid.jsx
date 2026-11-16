import PropTypes from 'prop-types'
import StatCard from './StatCard'

function StatisticsGrid({
  overview,
  isLoadingOverview,
  overviewError,
  onRetry,
}) {
  if (overviewError) {
    return (
      <section className="stats-grid" aria-label="QR code statistics">
        <div className="overview-error" role="alert">
          <p>{overviewError}</p>
          <button type="button" className="text-button" onClick={onRetry}>
            Retry
          </button>
        </div>
      </section>
    )
  }

  const isLoading = isLoadingOverview || !overview

  return (
    <section className="stats-grid" aria-label="QR code statistics">
      <StatCard
        title="Total QR Codes"
        icon="▦"
        tone="purple"
        value={isLoading ? '...' : overview.totalQrCodes}
        footer={<span className="neutral-trend">All QR codes</span>}
      />

      <StatCard
        title="Total Scans"
        icon="⌁"
        tone="blue"
        value={isLoading ? '...' : overview.totalScans.toLocaleString('en-IN')}
        footer={
          <span className="neutral-trend">
            {isLoading
              ? "Loading today's scans..."
              : `${overview.todayScans.toLocaleString('en-IN')} today`}
          </span>
        }
      />

      <StatCard
        title="Active QR Codes"
        icon="✓"
        tone="green"
        value={isLoading ? '...' : overview.activeQrCodes}
        footer={<span className="neutral-trend">Currently active</span>}
      />

      <StatCard
        title="Average Daily Scans"
        icon="↗"
        tone="orange"
        value={
          isLoading ? '...' : overview.averageDailyScans.toFixed(1)
        }
        footer={
          <span className="neutral-trend">Since first QR was created</span>
        }
      />
    </section>
  )
}

StatisticsGrid.propTypes = {
  overview: PropTypes.shape({
    totalQrCodes: PropTypes.number.isRequired,
    activeQrCodes: PropTypes.number.isRequired,
    totalScans: PropTypes.number.isRequired,
    todayScans: PropTypes.number.isRequired,
    averageDailyScans: PropTypes.number.isRequired,
  }),
  isLoadingOverview: PropTypes.bool.isRequired,
  overviewError: PropTypes.string.isRequired,
  onRetry: PropTypes.func.isRequired,
}

export default StatisticsGrid
