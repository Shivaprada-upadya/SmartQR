import { useEffect, useState } from 'react'
import QRCode from 'qrcode'
import './App.css'

import Auth from './components/Auth'
import { getToken } from './services/api'
import { getCurrentUser, logout } from './services/auth.service'
import { getQrCodes, createQrCode, deleteQrCode, updateQrCode, getQrAnalytics} from './services/qr.service'

const navigation = [
  { label: 'Overview', icon: '◫', target: 'overview' },
  { label: 'Create QR', icon: '▦', target: 'create' },
  { label: 'My QR Codes', icon: '▤', target: 'recent' },
  { label: 'Analytics', icon: '▥', target: 'analytics' },
]

function App() {
  
  const [user, setUser] = useState(null)
  const [isCheckingSession, setIsCheckingSession] = useState(true)
  
  const [activeNav, setActiveNav] = useState('Overview')
  const [qrCodes, setQrCodes] = useState([])
  const [isLoadingQrs, setIsLoadingQrs] = useState(false)
  const [selectedAnalyticsQr, setSelectedAnalyticsQr] = useState(null)
  const [analyticsRange, setAnalyticsRange] = useState('7d')
  const [analytics, setAnalytics] = useState(null)
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(false)
  const [analyticsError, setAnalyticsError] = useState('')
  const [qrListError, setQrListError] = useState('')
  const [title, setTitle] = useState('')
  const [destination, setDestination] = useState('')
  const [qrType, setQrType] = useState('URL')
  const [qrMode, setQrMode] = useState('static')
  const [generatedQR, setGeneratedQR] = useState('')
  const [generatedTitle, setGeneratedTitle] = useState('')
  const [error, setError] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)

  const [editingQr, setEditingQr] = useState(null)
  const [editTitle, setEditTitle] = useState('')
  const [editDestination, setEditDestination] = useState('')
  const [editError, setEditError] = useState('')
  const [isUpdating, setIsUpdating] = useState(false)
  
  const userInitials = user?.name
  ?.split(' ')
  .map((part) => part[0])
  .join('')
  .slice(0, 2)
  .toUpperCase()

  useEffect(() => {
    const restoreSession = async () => {
      if (!getToken()) {
        setIsCheckingSession(false)
        return
      }
      
      try {
        const currentUser = await getCurrentUser()
        setUser(currentUser)
      } catch {
        logout()
      } finally {
        setIsCheckingSession(false)
      }
    }
    
    restoreSession()
  }, [])
  
  useEffect(() => {
    if (!user) return
    
    let isMounted = true
    
    const fetchQrCodes = async () => {
      setIsLoadingQrs(true)
      setQrListError('')
      
      try {
        const response = await getQrCodes({
          page: 1,
          limit: 5,
          sortBy: 'createdAt',
          sortOrder: 'desc',
        })
        
        if (!isMounted) return
        
        const formattedQrCodes = response.data.qrCodes.map((item) => ({
          id: item.id,
          title: item.title,
          destination: item.destination,
          type: item.qr_type.toUpperCase(),
          status: item.is_active ? 'Active' : 'Inactive',
          created: new Date(item.created_at).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
          }),
        }))
        
        setQrCodes(formattedQrCodes)

        setSelectedAnalyticsQr((current) => {
          if (
            current &&
            formattedQrCodes.some((qr) => String(qr.id) === current)
          ) {
            return current
          }

          return formattedQrCodes.length > 0
            ? String(formattedQrCodes[0].id)
            : ''
        })
      } catch (requestError) {
        if (isMounted) {
          setQrListError(requestError.message || 'Unable to load QR codes.')
        }
      } finally {
        if (isMounted) {
          setIsLoadingQrs(false)
        }
      }
    }
    
    fetchQrCodes()
    
    return () => {
      isMounted = false
    }
  }, [user])

  // Fetch analytics for the selected QR code
  useEffect(() => {
    if (!user || !selectedAnalyticsQr) return

    let isMounted = true

    const fetchAnalytics = async () => {
      setIsLoadingAnalytics(true)
      setAnalyticsError('')
      setAnalytics(null)

      try {
        const response = await getQrAnalytics(selectedAnalyticsQr, analyticsRange)

        if (!isMounted) return

        setAnalytics(response.data)
      } catch (requestError) {
        if (isMounted) {
          setAnalytics(null)
          setAnalyticsError(
            requestError.message || 'Unable to load QR analytics.',
          )
        }
      } finally {
        if (isMounted) {
          setIsLoadingAnalytics(false)
        }
      }
    }

    fetchAnalytics()

    return () => {
      isMounted = false
    }
  }, [user, selectedAnalyticsQr, analyticsRange])
  
  const handleLogout = () => {
    logout()
    setUser(null)
  }

  const handleDeleteQr = async (id) => {
  const confirmed = window.confirm(
    'Are you sure you want to delete this QR code?',
  )

  if (!confirmed) return

  try {
    await deleteQrCode(id)

    setQrCodes((previous) =>
      previous.filter((item) => item.id !== id),
    )
  } catch (requestError) {
    setQrListError(
      requestError.message || 'Unable to delete the QR code.',
    )
  }
}

const handleUpdateQr = async (event) => {
  event.preventDefault()
  setEditError('')

  const cleanTitle = editTitle.trim()
  const cleanDestination = editDestination.trim()

  if (!cleanTitle || !cleanDestination) {
    setEditError('Please enter both title and destination.')
    return
  }

  try {
    setIsUpdating(true)

    await updateQrCode(editingQr.id, {
      title: cleanTitle,
      destination: cleanDestination,
    })

    setQrCodes((previous) =>
      previous.map((item) =>
        item.id === editingQr.id
          ? {
              ...item,
              title: cleanTitle,
              destination: cleanDestination,
            }
          : item,
      ),
    )

    setEditingQr(null)
    setEditTitle('')
    setEditDestination('')
  } catch (requestError) {
    setEditError(
      requestError.message || 'Unable to update the QR code.',
    )
  } finally {
    setIsUpdating(false)
  }
}

  const handleEditClick = (item) => {
    setEditingQr(item)
    setEditTitle(item.title)
    setEditDestination(item.destination)
    setEditError('')
  }
 
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

    if (qrType === 'URL' || qrMode === 'dynamic') {
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

      // Save the QR code in PostgreSQL through the backend.
      const response = await createQrCode({
        title: cleanTitle,
        destination: cleanDestination,
        qrType: qrMode,
      })

      const savedQr = response.data.qrCode

      if (qrMode === 'dynamic' && !savedQr.short_code) {
        throw new Error('Dynamic QR code was created without a short code.')
      }

      const apiBaseUrl =
        import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'

      const qrContent =
        qrMode === 'dynamic'
          ? new URL(`/r/${savedQr.short_code}`, apiBaseUrl).toString()
          : cleanDestination

      // Generate a downloadable QR image in the browser.
      const image = await QRCode.toDataURL(qrContent, {
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

      // Add the database record to the dashboard.
      setQrCodes((previous) => [
        {
          id: savedQr.id,
          title: savedQr.title,
          destination: savedQr.destination,
          type: savedQr.qr_type.toUpperCase(),
          status: savedQr.is_active ? 'Active' : 'Inactive',
          created: new Date(savedQr.created_at).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
          }),
        },
        ...previous,
      ])

      setTitle('')
      setDestination('')
    } catch (requestError) {
      setError(requestError.message || 'Unable to create the QR code.')
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

  const deviceBreakdown = analytics?.deviceBreakdown ?? []
  const browserBreakdown = analytics?.browserBreakdown ?? []
  const operatingSystemBreakdown =
    analytics?.operatingSystemBreakdown ?? []
  const recentScans = analytics?.recentScans ?? []

  const getBreakdownPercentage = (scans) => {
    const total = Number(analytics?.summary?.total_scans ?? 0)

    return total > 0
      ? Math.round((Number(scans) / total) * 100)
      : 0
  }

  const formatScanDate = (date) => {
    if (!date) return 'Unknown date'

    return new Date(date).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

    // Analytics values for the selected QR code
  const dailyScans = analytics?.dailyScans ?? []

  const analyticsRangeLabels = {
    '7d': 'Last 7 days',
    '30d': 'Last 30 days',
    '90d': 'Last 90 days',
    all: 'All time',
  }

  const selectedRangeLabel = analyticsRangeLabels[analyticsRange]

  const totalScans = Number(analytics?.summary?.total_scans ?? 0)
  const todayScans = Number(analytics?.summary?.today_scans ?? 0)

  const averageScans = dailyScans.length
    ? (
        dailyScans.reduce(
          (total, item) => total + Number(item.scans),
          0,
        ) / dailyScans.length
      ).toFixed(1)
    : '0'

  // Scale chart points based on the actual scan counts
  const maxDailyScans = Math.max(
    ...dailyScans.map((item) => Number(item.scans)),
    0,
  )

  const chartAxisMax = Math.max(
    4,
    Math.ceil(maxDailyScans / 4) * 4,
  )

  const chartYAxisLabels = Array.from(
    { length: 5 },
    (_, index) => chartAxisMax - (index * chartAxisMax) / 4,
  )

  const chartPoints = dailyScans.map((item, index) => {
    const x =
      index * (600 / Math.max(dailyScans.length - 1, 1))

    const y =
      190 - (Number(item.scans) / chartAxisMax) * 160

    return `${x},${y}`
  })

  const chartPolygonPoints = chartPoints.length
    ? `0,190 ${chartPoints.join(' ')} 600,190`
    : ''

  const chartLabelInterval = Math.max(
    1,
    Math.ceil(dailyScans.length / 7),
  )

  if (isCheckingSession) {
    return (
      <main className="grid min-h-screen place-items-center bg-background">
        <p className="text-sm text-text-muted">Loading your workspace...</p>
      </main>
    )
  }

  if (!user) {
    return <Auth onAuthenticated={setUser} />
  }

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

          <div className="profile">
            <span className="avatar">{userInitials || 'U'}</span>

            <span className="profile-info">
              <strong>{user.name}</strong>
              <small>{user.email}</small>
            </span>

            <button
              type="button"
              className="profile-menu"
              onClick={handleLogout}
              title="Sign out"
              aria-label="Sign out"
            >
              ↪
            </button>
          </div>
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
              <span>Selected QR Scans</span>
              <span className="stat-icon blue">⌁</span>
            </div>
            <div className="stat-value">
              {isLoadingAnalytics ? '...' : totalScans.toLocaleString('en-IN')}
            </div>
            <div className="stat-foot">
              <span className="neutral-trend">
                {todayScans.toLocaleString('en-IN')} today
              </span>
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
              <span>Average Daily Scans</span>
              <span className="stat-icon orange">↗</span>
            </div>
            <div className="stat-value">
              {isLoadingAnalytics ? '...' : averageScans}
            </div>
            <div className="stat-foot">
              <span className="neutral-trend">{selectedRangeLabel}</span>
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
              <select
                className="period-select"
                value={selectedAnalyticsQr || ''}
                onChange={(event) => setSelectedAnalyticsQr(event.target.value)}
                disabled={qrCodes.length === 0}
              >
                <select
                  className="period-select"
                  value={analyticsRange}
                  onChange={(event) => setAnalyticsRange(event.target.value)}
                  aria-label="Analytics date range"
                >
                  <option value="7d">Last 7 days</option>
                  <option value="30d">Last 30 days</option>
                  <option value="90d">Last 90 days</option>
                  <option value="all">All time</option>
                </select>
                {qrCodes.length === 0 ? (
                  <option value="">No QR codes available</option>
                ) : (
                  qrCodes.map((qr) => (
                    <option key={qr.id} value={String(qr.id)}>
                      {qr.title}
                    </option>
                  ))
                )}
              </select>
            </div>

            <div className="chart-summary">
              <strong>
                {isLoadingAnalytics
                  ? '...'
                  : totalScans.toLocaleString('en-IN')}
              </strong>
              <span className="trend">
                {todayScans.toLocaleString('en-IN')} today
              </span>
              <small>scans in {selectedRangeLabel.toLowerCase()}</small>
            </div>

            <div className="chart">
              <div className="chart-y-labels">
                {chartYAxisLabels.map((value, index) => (
                  <span key={index}>
                    {Math.round(value).toLocaleString('en-IN')}
                  </span>
                ))}
              </div>
              <div className="chart-plot">
                <div className="chart-grid-lines">
                  <span></span><span></span><span></span><span></span><span></span>
                </div>
                <svg
                  viewBox="0 0 600 190"
                  preserveAspectRatio="none"
                  role="img"
                  aria-label="Daily QR code scan activity for the selected QR code"
                >
                  <defs>
                    <linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#8b5cf6" stopOpacity=".30" />
                      <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <polygon
                    points={chartPolygonPoints}
                    fill="url(#chartFill)"
                  />
                  <polyline
                    points={chartPoints.join(' ')}
                    fill="none"
                    stroke="#9b7bff"
                    strokeWidth="3"
                    vectorEffect="non-scaling-stroke"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <div className="chart-x-labels">
                  {dailyScans.map((item, index) => {
                    const isLast = index === dailyScans.length - 1

                    if (
                      index % chartLabelInterval !== 0 &&
                      !isLast
                    ) {
                      return null
                    }

                    const date = new Date(`${item.date}T00:00:00`)

                    return (
                      <span key={item.date}>
                        {analyticsRange === '7d'
                          ? date.toLocaleDateString('en-IN', {
                              weekday: 'short',
                            })
                          : date.toLocaleDateString('en-IN', {
                              day: '2-digit',
                              month: 'short',
                            })}
                      </span>
                    )
                  })}
                </div>
              </div>
            </div>
            <div className="chart-note">
              <span className="legend-dot"></span> QR code scans
              <span className="sample-note">
                {isLoadingAnalytics
                  ? 'Loading analytics...'
                  : analyticsError || 'Live analytics data'}
              </span>
            </div>
          </article>
                   <section className="analytics-details">
            <article className="panel breakdown-panel">
              <div className="panel-heading">
                <div>
                  <h3>Device Breakdown</h3>
                  <p>Devices used to scan this QR code.</p>
                </div>
              </div>

              {isLoadingAnalytics ? (
                <p>Loading device data...</p>
              ) : deviceBreakdown.length === 0 ? (
                <p>No device scan data available yet.</p>
              ) : (
                deviceBreakdown.map((item) => (
                  <div className="breakdown-item" key={item.device_type}>
                    <div className="breakdown-label">
                      <span>{item.device_type || 'Unknown'}</span>
                      <strong>{Number(item.scans).toLocaleString('en-IN')}</strong>
                    </div>
                    <div className="breakdown-track">
                      <div
                        className="breakdown-fill"
                        style={{
                          width: `${getBreakdownPercentage(item.scans)}%`,
                        }}
                      />
                    </div>
                    <small>{getBreakdownPercentage(item.scans)}%</small>
                  </div>
                ))
              )}
            </article>

            <article className="panel breakdown-panel">
              <div className="panel-heading">
                <div>
                  <h3>Browser Breakdown</h3>
                  <p>Browsers used for QR scans.</p>
                </div>
              </div>

              {isLoadingAnalytics ? (
                <p>Loading browser data...</p>
              ) : browserBreakdown.length === 0 ? (
                <p>No browser scan data available yet.</p>
              ) : (
                browserBreakdown.map((item) => (
                  <div className="breakdown-item" key={item.browser}>
                    <div className="breakdown-label">
                      <span>{item.browser || 'Unknown'}</span>
                      <strong>{Number(item.scans).toLocaleString('en-IN')}</strong>
                    </div>
                    <div className="breakdown-track">
                      <div
                        className="breakdown-fill"
                        style={{
                          width: `${getBreakdownPercentage(item.scans)}%`,
                        }}
                      />
                    </div>
                    <small>{getBreakdownPercentage(item.scans)}%</small>
                  </div>
                ))
              )}
            </article>

            <article className="panel breakdown-panel">
              <div className="panel-heading">
                <div>
                  <h3>Operating Systems</h3>
                  <p>Operating systems used for QR scans.</p>
                </div>
              </div>

              {isLoadingAnalytics ? (
                <p>Loading operating system data...</p>
              ) : operatingSystemBreakdown.length === 0 ? (
                <p>No operating system data available yet.</p>
              ) : (
                operatingSystemBreakdown.map((item) => (
                  <div
                    className="breakdown-item"
                    key={item.operating_system}
                  >
                    <div className="breakdown-label">
                      <span>{item.operating_system || 'Unknown'}</span>
                      <strong>{Number(item.scans).toLocaleString('en-IN')}</strong>
                    </div>
                    <div className="breakdown-track">
                      <div
                        className="breakdown-fill"
                        style={{
                          width: `${getBreakdownPercentage(item.scans)}%`,
                        }}
                      />
                    </div>
                    <small>{getBreakdownPercentage(item.scans)}%</small>
                  </div>
                ))
              )}
            </article>

            <article className="panel recent-scans-panel">
              <div className="panel-heading">
                <div>
                  <h3>Recent Scan Activity</h3>
                  <p>Latest 10 scans for the selected QR code.</p>
                </div>
              </div>

              {isLoadingAnalytics ? (
                <p>Loading recent scans...</p>
              ) : recentScans.length === 0 ? (
                <p>No scans recorded yet.</p>
              ) : (
                <div className="recent-scans-list">
                  {recentScans.map((scan) => (
                    <div className="recent-scan-item" key={scan.id}>
                      <div>
                        <strong>
                          {scan.device_type || 'Unknown device'}
                        </strong>
                        <span>
                          {scan.browser || 'Unknown browser'} ·{' '}
                          {scan.operating_system || 'Unknown OS'}
                        </span>
                        <small>
                          Referrer: {scan.referrer || 'Direct / Unknown'}
                        </small>
                      </div>
                      <time dateTime={scan.scanned_at}>
                        {formatScanDate(scan.scanned_at)}
                      </time>
                    </div>
                  ))}
                </div>
              )}
            </article>
          </section>

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
              <label htmlFor="qr-mode">QR Code Mode</label>
                <select
                  id="qr-mode"
                  value={qrMode}
                  onChange={(event) => {
                    const mode = event.target.value
                    setQrMode(mode)

                    if (mode === 'dynamic') {
                      setQrType('URL')
                    }
                  }}
                >
                  <option value="static">Static QR Code</option>
                  <option value="dynamic">Dynamic QR Code</option>
                </select>
              <select
                id="qr-type"
                value={qrType}
                onChange={(event) => setQrType(event.target.value)}
              >
                <option value="URL">Website URL</option>
                <option value="Text" disabled={qrMode === 'dynamic'}>
                  Plain Text
                </option>
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
                  <th>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {isLoadingQrs && (
                  <tr>
                    <td colSpan="6">Loading QR codes...</td>
                  </tr>
                )}

                {!isLoadingQrs && qrListError && (
                  <tr>
                    <td colSpan="6">{qrListError}</td>
                  </tr>
                )}

                {!isLoadingQrs && !qrListError && qrCodes.length === 0 && (
                  <tr>
                    <td colSpan="6">No QR codes found. Create your first QR code!</td>
                  </tr>
                )}

                {!isLoadingQrs && !qrListError && qrCodes.map((item) => (
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

                    <td>
                      <span className="type-badge">{item.type}</span>
                    </td>

                    <td>
                      <span className={`status-badge ${item.status.toLowerCase()}`}>
                        <span></span>{item.status}
                      </span>
                    </td>

                    <td className="date-cell">{item.created}</td>
                    <td>
                      <div className="action-buttons">
                        <button
                          type="button"
                          className="edit-button"
                          onClick={() => handleEditClick(item)}
                          aria-label={`Edit ${item.title}`}
                          title="Edit QR code"
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          className="delete-button"
                          onClick={() => handleDeleteQr(item.id)}
                          aria-label={`Delete ${item.title}`}
                          title="Delete QR code"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {editingQr && (
          <div className="edit-modal-overlay">
            <div
              className="edit-modal"
              role="dialog"
              aria-modal="true"
              aria-labelledby="edit-modal-title"
            >
              <div className="edit-modal-header">
                <div>
                  <h3 id="edit-modal-title">Edit QR Code</h3>
                  <p>Update your QR code information.</p>
                </div>

                <button
                  type="button"
                  className="modal-close-button"
                  onClick={() => setEditingQr(null)}
                  aria-label="Close edit form"
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleUpdateQr}>
                <div className="edit-form-group">
                  <label htmlFor="edit-title">QR Code Title</label>
                  <input
                    id="edit-title"
                    type="text"
                    value={editTitle}
                    onChange={(event) =>
                      setEditTitle(event.target.value)
                    }
                    maxLength={150}
                    required
                  />
                </div>

                <div className="edit-form-group">
                  <label htmlFor="edit-destination">
                    Destination / Content
                  </label>
                  <textarea
                    id="edit-destination"
                    value={editDestination}
                    onChange={(event) =>
                      setEditDestination(event.target.value)
                    }
                    rows={4}
                    maxLength={2048}
                    required
                  />
                </div>

                {editError && (
                  <p className="form-error" role="alert">
                    {editError}
                  </p>
                )}

                <div className="edit-modal-actions">
                  <button
                    type="button"
                    className="cancel-edit-button"
                    onClick={() => setEditingQr(null)}
                    disabled={isUpdating}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="primary-button"
                    disabled={isUpdating}
                  >
                    {isUpdating ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <footer className="footer">
          <span>© 2026 SmartQR. Built with care.</span>
          <span>SmartQR <span className="footer-dot">•</span> Development Preview</span>
        </footer>
      </main>
    </div>
  )
}

export default App
