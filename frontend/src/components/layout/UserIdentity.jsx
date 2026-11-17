import PropTypes from 'prop-types'

function UserIdentity({
  user,
  userInitials,
  className = '',
  showEmail = true,
}) {
  return (
    <div className={`user-identity ${className}`.trim()}>
      <span className="user-avatar" aria-hidden="true">
        {userInitials || 'U'}
      </span>
      <span className="user-identity__details">
        <strong title={user.name}>{user.name}</strong>
        {showEmail && <small title={user.email}>{user.email}</small>}
      </span>
    </div>
  )
}

UserIdentity.propTypes = {
  user: PropTypes.shape({
    name: PropTypes.string.isRequired,
    email: PropTypes.string.isRequired,
  }).isRequired,
  userInitials: PropTypes.string,
  className: PropTypes.string,
  showEmail: PropTypes.bool,
}

export default UserIdentity
