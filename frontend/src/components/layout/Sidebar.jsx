import PropTypes from 'prop-types'

const navigation = [
  { label: 'Overview', icon: '◫', target: 'overview' },
  { label: 'Create QR', icon: '▦', target: 'create' },
  { label: 'My QR Codes', icon: '▤', target: 'recent' },
  { label: 'Analytics', icon: '▥', target: 'analytics' },
]

function Sidebar({ user, userInitials, activeNav, onNavigate, onLogout }) {
  return (
    <aside className="sidebar">
      <a className="brand" href="#overview">
        <span className="brand-icon">S</span>
        <span>Smart<span className="brand-accent">QR</span></span>
      </a>

      <div className="workspace-label">WORKSPACE</div>

      <nav className="navigation" aria-label="Main navigation">
        {navigation.map((item) => (
          <button
            key={item.label}
            type="button"
            className={`nav-item ${activeNav === item.label ? 'active' : ''}`}
            aria-current={activeNav === item.label ? 'page' : undefined}
            onClick={() => onNavigate(item.target, item.label)}
          >
            <span className="nav-icon">{item.icon}</span>
            {item.label}
          </button>
        ))}
      </nav>

      <div className="sidebar-bottom">
        <div className="upgrade-card">
          <div className="upgrade-icon">✦</div>
          <h3>Unlock more with SmartQR</h3>
          <p>Advanced analytics and powerful QR management features.</p>
          <span className="coming-soon">COMING SOON</span>
        </div>

        <div className="profile">
          <span className="avatar">{userInitials || 'U'}</span>

          <span className="profile-info">
            <strong>{user.name}</strong>
            <small>{user.email}</small>
          </span>

          <button
            type="button"
            className="profile-menu"
            onClick={onLogout}
            title="Sign out"
            aria-label="Sign out"
          >
            ↪
          </button>
        </div>
      </div>
    </aside>
  )
}

Sidebar.propTypes = {
  user: PropTypes.shape({
    name: PropTypes.string.isRequired,
    email: PropTypes.string.isRequired,
  }).isRequired,
  userInitials: PropTypes.string,
  activeNav: PropTypes.string.isRequired,
  onNavigate: PropTypes.func.isRequired,
  onLogout: PropTypes.func.isRequired,
}

export default Sidebar
