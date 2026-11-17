import PropTypes from 'prop-types'

function EmptyState({
  icon,
  title,
  description,
  action,
  className = '',
}) {
  return (
    <div className={`ui-empty-state ${className}`.trim()}>
      {icon && <span className="ui-empty-state__icon" aria-hidden="true">{icon}</span>}
      <h3 className="ui-empty-state__title">{title}</h3>
      {description && (
        <p className="ui-empty-state__description">{description}</p>
      )}
      {action && <div className="ui-empty-state__action">{action}</div>}
    </div>
  )
}

EmptyState.propTypes = {
  icon: PropTypes.node,
  title: PropTypes.node.isRequired,
  description: PropTypes.node,
  action: PropTypes.node,
  className: PropTypes.string,
}

export default EmptyState
