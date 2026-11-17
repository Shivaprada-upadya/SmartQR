import PropTypes from 'prop-types'

function LoadingSpinner({
  label = 'Loading',
  size = 'md',
  showLabel = false,
  className = '',
}) {
  const classes = [
    'ui-spinner-wrap',
    `ui-spinner-wrap--${size}`,
    className,
  ].filter(Boolean).join(' ')

  return (
    <span className={classes} role="status" aria-live="polite">
      <span className="ui-spinner" aria-hidden="true" />
      <span className="ui-visually-hidden">{label}</span>
      {showLabel && <span className="ui-spinner-label">{label}</span>}
    </span>
  )
}

LoadingSpinner.propTypes = {
  label: PropTypes.string,
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  showLabel: PropTypes.bool,
  className: PropTypes.string,
}

export default LoadingSpinner
