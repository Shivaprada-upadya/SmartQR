import PropTypes from 'prop-types'
import StatCard from './StatCard'

function StatisticsGrid({
  totalQRCodes,
  totalScans,
  todayScans,
  activeQRCodes,
  averageScans,
  selectedRangeLabel,
  isLoadingAnalytics,
}) {
  return (
    <section className="stats-grid" aria-label="QR code statistics">
      <StatCard
        title="Total QR Codes"
        icon="▦"
        tone="purple"
        value={totalQRCodes}
        footer={
          <>
            <span className="trend">↑ 12.5%</span>
            <span>vs last month</span>
          </>
        }
      />

      <StatCard
        title="Selected QR Scans"
        icon="⌁"
        tone="blue"
        value={
          isLoadingAnalytics ? '...' : totalScans.toLocaleString('en-IN')
        }
        footer={
          <span className="neutral-trend">
            {todayScans.toLocaleString('en-IN')} today
          </span>
        }
      />

      <StatCard
        title="Active QR Codes"
        icon="✓"
        tone="green"
        value={activeQRCodes}
        footer={<span className="neutral-trend">Currently active</span>}
      />

      <StatCard
        title="Average Daily Scans"
        icon="↗"
        tone="orange"
        value={isLoadingAnalytics ? '...' : averageScans}
        footer={
          <span className="neutral-trend">{selectedRangeLabel}</span>
        }
      />
    </section>
  )
}

StatisticsGrid.propTypes = {
  totalQRCodes: PropTypes.number.isRequired,
  totalScans: PropTypes.number.isRequired,
  todayScans: PropTypes.number.isRequired,
  activeQRCodes: PropTypes.number.isRequired,
  averageScans: PropTypes.string.isRequired,
  selectedRangeLabel: PropTypes.string.isRequired,
  isLoadingAnalytics: PropTypes.bool.isRequired,
}

export default StatisticsGrid
