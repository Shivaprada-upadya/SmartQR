import PropTypes from 'prop-types'

function StatCard({ title, icon, tone, value, footer }) {
  return (
    <article className="stat-card">
      <div className="stat-top">
        <span>{title}</span>
        <span className={`stat-icon ${tone}`}>{icon}</span>
      </div>
      <div className="stat-value">{value}</div>
      <div className="stat-foot">{footer}</div>
    </article>
  )
}

StatCard.propTypes = {
  title: PropTypes.string.isRequired,
  icon: PropTypes.node.isRequired,
  tone: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  footer: PropTypes.node.isRequired,
}

export default StatCard
