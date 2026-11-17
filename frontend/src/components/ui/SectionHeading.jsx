import PropTypes from 'prop-types'

function SectionHeading({
  title,
  description,
  level = 2,
  actions,
  className = '',
}) {
  const Heading = `h${level}`

  return (
    <div className={`ui-section-heading ${className}`.trim()}>
      <div className="ui-section-heading__copy">
        <Heading className="ui-section-heading__title">{title}</Heading>
        {description && (
          <p className="ui-section-heading__description">{description}</p>
        )}
      </div>
      {actions && <div className="ui-section-heading__actions">{actions}</div>}
    </div>
  )
}

SectionHeading.propTypes = {
  title: PropTypes.node.isRequired,
  description: PropTypes.node,
  level: PropTypes.oneOf([1, 2, 3, 4, 5, 6]),
  actions: PropTypes.node,
  className: PropTypes.string,
}

export default SectionHeading
