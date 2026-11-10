import { useState } from 'react'
import QRCode from 'qrcode'
import './App.css'

const initialQRCodes = [
  {
    id: 1,
    title: 'Company Website',
    destination: 'https://example.com',
    type: 'URL',
    status: 'Active',
    created: 'Today',
  },
  {
    id: 2,
    title: 'Product Documentation',
    destination: 'https://docs.example.com',
    type: 'URL',
    status: 'Active',
    created: 'Yesterday',
  },
  {
    id: 3,
    title: 'Contact Information',
    destination: 'Name: SmartQR Support',
    type: 'Text',
    status: 'Active',
    created: 'Nov 08, 2026',
  },
  {
    id: 4,
    title: 'Event Registration',
    destination: 'https://example.com/register',
    type: 'URL',
    status: 'Inactive',
    created: 'Nov 06, 2026',
  },
]

const navigation = [
  { label: 'Overview', icon: '◫', target: 'overview' },
  { label: 'Create QR', icon: '▦', target: 'create' },
  { label: 'My QR Codes', icon: '▤', target: 'recent' },
  { label: 'Analytics', icon: '▥', target: 'analytics' },
]

const chartValues = [38, 52, 43, 68, 56, 76, 62, 84, 71, 93, 78, 100]

function App() {
  const [activeNav, setActiveNav] = useState('Overview')
  const [qrCodes, setQrCodes] = useState(initialQRCodes)
  const [title, setTitle] = useState('')
  const [destination, setDestination] = useState('')
  const [qrType, setQrType] = useState('URL')
  const [generatedQR, setGeneratedQR] = useState('')
  const [generatedTitle, setGeneratedTitle] = useState('')
  const [error, setError] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)

  const handleGenerate = async (event) => {
    event.preventDefault()
    setError('')
    setGeneratedQR('')

    const cleanTitle = title.trim()
    const cleanDestination = destination.trim()

    if (!cleanTitle || !cleanDestination) {
      setError('Please enter both a QR title and content.')
      return
    }

    if (qrType === 'URL') {
      try {
        const parsedUrl = new URL(cleanDestination)
        if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
          throw new Error('Invalid protocol')
        }
      } catch {
        setError('Enter a valid URL, including https://')
        return
      }
    }

    try {
      setIsGenerating(true)

      const image = await QRCode.toDataURL(cleanDestination, {
        width: 280,
        margin: 2,
        errorCorrectionLevel: 'H',
        color: {
          dark: '#111827',
          light: '#ffffff',
        },
      })

      setGeneratedQR(image)
      setGeneratedTitle(cleanTitle)

      setQrCodes((previous) => [
        {
          id: Date.now(),
          title: cleanTitle,
          destination: cleanDestination,
          type: qrType,
          status: 'Active',
          created: 'Just now',
        },
        ...previous,
      ])

      setTitle('')
      setDestination('')
    } catch {
      setError('Unable to generate the QR code. Please try again.')
    } finally {
      setIsGenerating(false)
    }
  }

  const scrollToSection = (target, label) => {
    setActiveNav(label)
    document.getElementById(target)?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    })
  }

  const totalQRCodes = qrCodes.length
  const activeQRCodes = qrCodes.filter(
    (item) => item.status === 'Active',
  ).length

  return (
    <div className="app-shell">
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
              onClick={() => scrollToSection(item.target, item.label)}
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

          <button
            className="profile"
            type="button"
            onClick={() => setActiveNav('Overview')}
          >
            <span className="avatar">SU</span>
            <span className="profile-info">
              <strong>Workspace User</strong>
              <small>Free workspace</small>
            </span>
            <span className="profile-menu">···</span>
          </button>
        </div>
      </aside>

      <main className="main-content" id="overview">
        <header className="topbar">
          <div>
            <div className="breadcrumb">Workspace <span>/</span> {activeNav}</div>
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
              onClick={() => scrollToSection('create', 'Create QR')}
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

        <section className="stats-grid" aria-label="QR code statistics">
          <article className="stat-card">
            <div className="stat-top">
              <span>Total QR Codes</span>
              <span className="stat-icon purple">▦</span>
            </div>
            <div className="stat-value">{totalQRCodes}</div>
            <div className="stat-foot">
              <span className="trend">↑ 12.5%</span>
              <span>vs last month</span>
            </div>
          </article>

          <article className="stat-card">
            <div className="stat-top">
              <span>Total Scans</span>
              <span className="stat-icon blue">⌁</span>
            </div>
            <div className="stat-value">12,840</div>
            <div className="stat-foot">
              <span className="trend">↑ 18.2%</span>
              <span>vs last month</span>
            </div>
          </article>

          <article className="stat-card">
            <div className="stat-top">
              <span>Active QR Codes</span>
              <span className="stat-icon green">✓</span>
            </div>
            <div className="stat-value">{activeQRCodes}</div>
            <div className="stat-foot">
              <span className="neutral-trend">Currently active</span>
            </div>
          </article>

          <article className="stat-card">
            <div className="stat-top">
              <span>Average Scans</span>
              <span className="stat-icon orange">↗</span>
            </div>
            <div className="stat-value">428</div>
            <div className="stat-foot">
              <span className="trend">↑ 8.4%</span>
              <span>vs last month</span>
            </div>
          </article>
        </section>

        <section className="content-grid">
          <article className="panel analytics-panel" id="analytics">
            <div className="panel-heading">
              <div>
                <h3>Scan Analytics</h3>
                <p>Track how your QR codes perform over time.</p>
              </div>
              <select className="period-select" defaultValue="7">
                <option value="7">Last 7 days</option>
                <option value="30">Last 30 days</option>
                <option value="90">Last 90 days</option>
              </select>
            </div>

            <div className="chart-summary">
              <strong>8,249</strong>
              <span className="trend">↑ 14.8%</span>
              <small>scans this week</small>
            </div>

            <div className="chart">
              <div className="chart-y-labels">
                <span>1,000</span>
                <span>750</span>
                <span>500</span>
                <span>250</span>
                <span>0</span>
              </div>
              <div className="chart-plot">
                <div className="chart-grid-lines">
                  <span></span><span></span><span></span><span></span><span></span>
                </div>
                <svg
                  viewBox="0 0 600 190"
                  preserveAspectRatio="none"
                  role="img"
                  aria-label="Illustrative weekly scan activity chart"
                >
                  <defs>
                    <linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#8b5cf6" stopOpacity=".30" />
                      <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <polygon
                    points={`0,190 ${chartValues.map((value, index) => `${index * (600 / (chartValues.length - 1))},${190 - value * 1.65}`).join(' ')} 600,190`}
                    fill="url(#chartFill)"
                  />
                  <polyline
                    points={chartValues.map((value, index) => `${index * (600 / (chartValues.length - 1))},${190 - value * 1.65}`).join(' ')}
                    fill="none"
                    stroke="#9b7bff"
                    strokeWidth="3"
                    vectorEffect="non-scaling-stroke"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <div className="chart-x-labels">
                  <span>Mon</span><span>Tue</span><span>Wed</span>
                  <span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
                </div>
              </div>
            </div>
            <div className="chart-note">
              <span className="legend-dot"></span> QR code scans
              <span className="sample-note">Sample analytics data</span>
            </div>
          </article>

          <article className="panel create-panel" id="create">
            <div className="panel-heading">
              <div>
                <h3>Create a QR Code</h3>
                <p>Generate a QR code in seconds.</p>
              </div>
              <span className="create-icon">▦</span>
            </div>

            <form onSubmit={handleGenerate}>
              <label htmlFor="qr-title">QR Code Name</label>
              <input
                id="qr-title"
                type="text"
                placeholder="e.g. My Website"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                maxLength={60}
              />

              <label htmlFor="qr-type">Content Type</label>
              <select
                id="qr-type"
                value={qrType}
                onChange={(event) => setQrType(event.target.value)}
              >
                <option value="URL">Website URL</option>
                <option value="Text">Plain Text</option>
              </select>

              <label htmlFor="qr-content">
                {qrType === 'URL' ? 'Website URL' : 'Text Content'}
              </label>
              <textarea
                id="qr-content"
                placeholder={
                  qrType === 'URL'
                    ? 'https://example.com'
                    : 'Enter the text for your QR code'
                }
                value={destination}
                onChange={(event) => setDestination(event.target.value)}
                rows={3}
                maxLength={2000}
              />

              {error && <p className="form-error" role="alert">{error}</p>}

              <button
                className="primary-button generate-button"
                type="submit"
                disabled={isGenerating}
              >
                {isGenerating ? 'Generating...' : '✦  Generate QR Code'}
              </button>
            </form>

            {generatedQR && (
              <div className="qr-result">
                <div className="qr-preview">
                  <img src={generatedQR} alt={`QR code for ${generatedTitle}`} />
                </div>
                <div className="qr-result-info">
                  <strong>{generatedTitle}</strong>
                  <span>QR code generated successfully</span>
                  <a
                    className="download-link"
                    href={generatedQR}
                    download="smartqr-code.png"
                  >
                    ↓ Download PNG
                  </a>
                </div>
              </div>
            )}
          </article>
        </section>

        <section className="panel recent-panel" id="recent">
          <div className="panel-heading recent-heading">
            <div>
              <h3>Recent QR Codes</h3>
              <p>View and manage your recently created QR codes.</p>
            </div>
            <button
              className="text-button"
              type="button"
              onClick={() => setActiveNav('My QR Codes')}
            >
              View all <span>→</span>
            </button>
          </div>

          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>QR CODE</th>
                  <th>CONTENT</th>
                  <th>TYPE</th>
                  <th>STATUS</th>
                  <th>CREATED</th>
                </tr>
              </thead>
              <tbody>
                {qrCodes.slice(0, 5).map((item) => (
                  <tr key={item.id}>
                    <td>
                      <div className="qr-name">
                        <span className="mini-qr">▦</span>
                        <strong>{item.title}</strong>
                      </div>
                    </td>
                    <td className="destination-cell" title={item.destination}>
                      {item.destination}
                    </td>
                    <td><span className="type-badge">{item.type}</span></td>
                    <td>
                      <span className={`status-badge ${item.status.toLowerCase()}`}>
                        <span></span>{item.status}
                      </span>
                    </td>
                    <td className="date-cell">{item.created}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <footer className="footer">
          <span>© 2026 SmartQR. Built with care.</span>
          <span>SmartQR <span className="footer-dot">•</span> Development Preview</span>
        </footer>
      </main>
    </div>
  )
}

export default App
