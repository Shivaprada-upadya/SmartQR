import PropTypes from 'prop-types'

function Badge({ variant = 'neutral', className = '', children }) {
  const classes = [
    'ui-badge',
    `ui-badge--${variant}`,
    className,
  ].filter(Boolean).join(' ')

  return <span className={classes}>{children}</span>
}

Badge.propTypes = {
  variant: PropTypes.oneOf([
    'neutral',
    'brand',
    'info',
    'success',
    'warning',
    'danger',
  ]),
  className: PropTypes.string,
  children: PropTypes.node.isRequired,
}

export default Badge
