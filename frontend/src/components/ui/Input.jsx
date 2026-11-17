import { useId } from 'react'
import PropTypes from 'prop-types'

function Input({
  as: Control = 'input',
  id,
  label,
  hint,
  error,
  required = false,
  className = '',
  'aria-describedby': ariaDescribedBy,
  ...props
}) {
  const generatedId = useId()
  const controlId = id || generatedId
  const descriptionIds = [
    ariaDescribedBy,
    hint ? `${controlId}-hint` : '',
    error ? `${controlId}-error` : '',
  ].filter(Boolean).join(' ')

  const control = (
    <Control
      {...props}
      id={controlId}
      className={`ui-field ui-input ${className}`.trim()}
      required={required}
      aria-invalid={error ? true : undefined}
      aria-describedby={descriptionIds || undefined}
    />
  )

  if (!label && !hint && !error) {
    return control
  }

  return (
    <div className="ui-field-group">
      {label && (
        <label className="ui-field-label" htmlFor={controlId}>
          {label}
          {required && <span aria-hidden="true" className="ui-required-mark"> *</span>}
        </label>
      )}
      {control}
      {hint && <span className="ui-field-hint" id={`${controlId}-hint`}>{hint}</span>}
      {error && (
        <span className="ui-field-error" id={`${controlId}-error`} role="alert">
          {error}
        </span>
      )}
    </div>
  )
}

Input.propTypes = {
  as: PropTypes.oneOf(['input', 'textarea']),
  id: PropTypes.string,
  label: PropTypes.string,
  hint: PropTypes.string,
  error: PropTypes.string,
  required: PropTypes.bool,
  className: PropTypes.string,
  'aria-describedby': PropTypes.string,
}

export default Input
