import PropTypes from 'prop-types'
import { Button } from '../ui'
import Icon from './Icon'
import navigationItems from './navigation'
import UserIdentity from './UserIdentity'

function DashboardHeader({
  activeNav,
  user,
  userInitials,
  onCreateQr,
}) {
  const currentPage = navigationItems.find(
    (item) => item.label === activeNav,
  ) || navigationItems[0]

  return (
    <header className="topbar">
      <div className="topbar-copy">
        <nav className="breadcrumb" aria-label="Breadcrumb">
          <span>Workspace</span>
          <span className="breadcrumb-separator" aria-hidden="true">/</span>
          <span aria-current="page">{activeNav}</span>
        </nav>
        <h1>{currentPage.title}</h1>
        <p className="topbar-description">{currentPage.description}</p>
      </div>

      <div className="topbar-actions">
        <UserIdentity
          user={user}
          userInitials={userInitials}
          className="header-account"
          showEmail={false}
        />
        <Button
          variant="primary"
          className="top-create"
          leadingIcon={<Icon name="create" size={18} />}
          aria-label="Create QR code"
          onClick={onCreateQr}
        >
          Create QR
        </Button>
      </div>
    </header>
  )
}

DashboardHeader.propTypes = {
  activeNav: PropTypes.string.isRequired,
  user: PropTypes.shape({
    name: PropTypes.string.isRequired,
    email: PropTypes.string.isRequired,
  }).isRequired,
  userInitials: PropTypes.string,
  onCreateQr: PropTypes.func.isRequired,
}

export default DashboardHeader
