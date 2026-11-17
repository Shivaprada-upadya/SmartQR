import PropTypes from 'prop-types'
import { Button } from '../ui'
import BrandMark from './BrandMark'
import Icon from './Icon'
import navigationItems from './navigation'
import UserIdentity from './UserIdentity'

function Sidebar({ user, userInitials, activeNav, onNavigate, onLogout }) {
  return (
    <aside className="sidebar">
      <BrandMark />

      <div className="workspace-label">WORKSPACE</div>

      <nav className="navigation" aria-label="Main navigation">
        {navigationItems.map((item) => {
          const isActive = activeNav === item.label

          return (
            <button
              key={item.label}
              type="button"
              className={`nav-item ${isActive ? 'active' : ''}`}
              aria-current={isActive ? 'page' : undefined}
              aria-label={item.label}
              title={item.label}
              onClick={() => onNavigate(item.target, item.label)}
            >
              <Icon name={item.icon} className="nav-icon" />
              <span className="nav-item-label">{item.label}</span>
            </button>
          )
        })}
      </nav>

      <div className="sidebar-profile">
        <UserIdentity
          user={user}
          userInitials={userInitials}
          className="sidebar-identity"
        />
        <Button
          variant="ghost"
          size="sm"
          className="profile-signout"
          leadingIcon={<Icon name="logout" size={18} />}
          aria-label="Sign out"
          title="Sign out"
          onClick={onLogout}
        >
          <span className="profile-signout-label">Sign out</span>
        </Button>
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
