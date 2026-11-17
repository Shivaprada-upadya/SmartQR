import PropTypes from 'prop-types'
import LoadingSpinner from './LoadingSpinner'

function Button({
  variant = 'primary',
  size = 'md',
  type = 'button',
  className = '',
  disabled = false,
  isLoading = false,
  loadingLabel = 'Loading',
  leadingIcon,
  children,
  ...props
}) {
  const classes = [
    'ui-button',
    `ui-button--${variant}`,
    `ui-button--${size}`,
    className,
  ].filter(Boolean).join(' ')

  return (
    <button
      {...props}
      type={type}
      className={classes}
      disabled={disabled || isLoading}
      aria-busy={isLoading || undefined}
    >
      {isLoading && <LoadingSpinner label={loadingLabel} size="sm" />}
      {leadingIcon && (
        <span className="ui-button__icon" aria-hidden="true">
          {leadingIcon}
        </span>
      )}
      <span className="ui-button__content">{children}</span>
    </button>
  )
}

Button.propTypes = {
  variant: PropTypes.oneOf(['primary', 'secondary', 'ghost', 'danger']),
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  type: PropTypes.oneOf(['button', 'submit', 'reset']),
  className: PropTypes.string,
  disabled: PropTypes.bool,
  isLoading: PropTypes.bool,
  loadingLabel: PropTypes.string,
  leadingIcon: PropTypes.node,
  children: PropTypes.node.isRequired,
}

export default Button
