import PropTypes from 'prop-types'

function DashboardHeader({ activeNav, onCreateQr }) {
  return (
    <>
      <header className="topbar">
        <div>
          <div className="breadcrumb">
            Workspace <span>/</span> {activeNav}
          </div>
          <h1>{activeNav === 'Overview' ? 'Dashboard' : activeNav}</h1>
        </div>

        <div className="topbar-actions">
          <span className="system-status">
            <span className="status-dot"></span>
            All systems operational
          </span>
          <button
            type="button"
            className="primary-button top-create"
            onClick={onCreateQr}
          >
            <span>＋</span> Create QR
          </button>
        </div>
      </header>

      <section className="welcome-section">
        <div>
          <h2>Welcome to SmartQR <span>👋</span></h2>
          <p>Manage your QR codes and track their performance.</p>
        </div>
        <div className="date-label">NOVEMBER 2026</div>
      </section>
    </>
  )
}

DashboardHeader.propTypes = {
  activeNav: PropTypes.string.isRequired,
  onCreateQr: PropTypes.func.isRequired,
}

export default DashboardHeader
