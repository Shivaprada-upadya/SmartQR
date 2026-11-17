import PropTypes from 'prop-types'

function Card({
  as: Container = 'div',
  variant = 'default',
  padding = 'md',
  className = '',
  children,
  ...props
}) {
  const classes = [
    'ui-card',
    `ui-card--${variant}`,
    `ui-card--padding-${padding}`,
    className,
  ].filter(Boolean).join(' ')

  return (
    <Container {...props} className={classes}>
      {children}
    </Container>
  )
}

Card.propTypes = {
  as: PropTypes.elementType,
  variant: PropTypes.oneOf(['default', 'raised', 'subtle']),
  padding: PropTypes.oneOf(['none', 'sm', 'md', 'lg']),
  className: PropTypes.string,
  children: PropTypes.node.isRequired,
}

export default Card
