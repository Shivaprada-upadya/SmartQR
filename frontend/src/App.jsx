import { useEffect, useState } from 'react'
import QRCode from 'qrcode'
import './App.css'

import Auth from './components/Auth'
import AnalyticsPanel from './components/dashboard/AnalyticsPanel'
import StatisticsGrid from './components/dashboard/StatisticsGrid'
import DashboardHeader from './components/layout/DashboardHeader'
import Sidebar from './components/layout/Sidebar'
import EditQrModal from './components/qr/EditQrModal'
import QrCodeCreatePanel from './components/qr/QrCodeCreatePanel'
import QrCodeManagementPanel from './components/qr/QrCodeManagementPanel'
import { getToken } from './services/api'
import { getCurrentUser, logout } from './services/auth.service'
import {
  bulkManageQrCodes,
  createQrCode,
  deleteQrCode,
  getQrAnalytics,
  getQrCodes,
  getQrOverview,
  updateQrCode,
} from './services/qr.service'

const getSafeFilename = (title) => {
  const filename = title
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

  return filename || 'smartqr-code'
}

function App() {
  
  const [user, setUser] = useState(null)
  const [isCheckingSession, setIsCheckingSession] = useState(true)
  
  const [activeNav, setActiveNav] = useState('Overview')
  const [qrOverview, setQrOverview] = useState(null)
  const [isLoadingOverview, setIsLoadingOverview] = useState(false)
  const [overviewError, setOverviewError] = useState('')
  const [overviewRefreshKey, setOverviewRefreshKey] = useState(0)
  const [qrCodes, setQrCodes] = useState([])
  const [isLoadingQrs, setIsLoadingQrs] = useState(false)
  const [selectedQrIds, setSelectedQrIds] = useState([])
  const [isBulkManaging, setIsBulkManaging] = useState(false)
  const [bulkActionError, setBulkActionError] = useState('')
  const [bulkActionMessage, setBulkActionMessage] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(5)
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('')
  const [qrTypeFilter, setQrTypeFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [listRefreshKey, setListRefreshKey] = useState(0)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 5,
    totalRecords: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  })
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
  const [generatedQRContent, setGeneratedQRContent] = useState('')
  const [qrExportSize, setQrExportSize] = useState('512')
  const [exportError, setExportError] = useState('')
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
    const timeoutId = window.setTimeout(() => {
      setDebouncedSearchTerm(searchTerm)
    }, 300)

    return () => window.clearTimeout(timeoutId)
  }, [searchTerm])
  
  useEffect(() => {
    if (!user || searchTerm !== debouncedSearchTerm) return
    
    let isMounted = true
    
    const fetchQrCodes = async () => {
      setIsLoadingQrs(true)
      setQrListError('')
      
      try {
        const response = await getQrCodes({
          page: currentPage,
          limit: pageSize,
          search: debouncedSearchTerm,
          qrType: qrTypeFilter || undefined,
          isActive: statusFilter === ''
            ? undefined
            : statusFilter,
          sortBy: 'createdAt',
          sortOrder: 'desc',
        })
        
        if (!isMounted) return
        
        const formattedQrCodes = response.data.qrCodes.map((item) => ({
          id: item.id,
          title: item.title,
          destination: item.destination,
          short_code: item.short_code,
          type: item.qr_type.toUpperCase(),
          status: item.is_active ? 'Active' : 'Inactive',
          created: new Date(item.created_at).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
          }),
        }))
        
        setQrCodes(formattedQrCodes)
        setPagination(response.pagination)

        setSelectedAnalyticsQr((current) => {
          if (current) {
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
  }, [
    user,
    currentPage,
    pageSize,
    listRefreshKey,
    searchTerm,
    debouncedSearchTerm,
    qrTypeFilter,
    statusFilter,
  ])

  useEffect(() => {
    if (!user) return

    let isMounted = true

    const fetchQrOverview = async () => {
      setIsLoadingOverview(true)
      setOverviewError('')

      try {
        const response = await getQrOverview()

        if (!isMounted) return

        setQrOverview(response.data)
      } catch (requestError) {
        if (isMounted) {
          setQrOverview(null)
          setOverviewError(
            requestError.message || 'Unable to load QR overview.',
          )
        }
      } finally {
        if (isMounted) {
          setIsLoadingOverview(false)
        }
      }
    }

    fetchQrOverview()

    return () => {
      isMounted = false
    }
  }, [user, overviewRefreshKey])

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
    setSelectedQrIds([])
    setQrOverview(null)
    setOverviewError('')
    setIsLoadingOverview(false)
  }

  const clearQrSelection = () => {
    setSelectedQrIds([])
    setBulkActionError('')
    setBulkActionMessage('')
  }

  const handleSearchChange = (value) => {
    clearQrSelection()
    setSearchTerm(value)
    setCurrentPage(1)
  }

  const handleQrTypeFilterChange = (value) => {
    clearQrSelection()
    setQrTypeFilter(value)
    setCurrentPage(1)
  }

  const handleStatusFilterChange = (value) => {
    clearQrSelection()
    setStatusFilter(value)
    setCurrentPage(1)
  }

  const handleResetFilters = () => {
    clearQrSelection()
    setSearchTerm('')
    setQrTypeFilter('')
    setStatusFilter('')
    setCurrentPage(1)
  }

  const handleTogglePageSelection = () => {
    const pageIds = qrCodes.map((item) => String(item.id))
    const allSelected = pageIds.every((id) => selectedQrIds.includes(id))

    setSelectedQrIds((current) =>
      allSelected
        ? current.filter((id) => !pageIds.includes(id))
        : [...new Set([...current, ...pageIds])],
    )
  }

  const handleToggleSelection = (id) => {
    const selectedId = String(id)

    setSelectedQrIds((current) =>
      current.includes(selectedId)
        ? current.filter((id) => id !== selectedId)
        : [...current, selectedId],
    )
  }

  const handlePageSizeChange = (size) => {
    clearQrSelection()
    setPageSize(size)
    setCurrentPage(1)
  }

  const handlePageChange = (page) => {
    clearQrSelection()
    setCurrentPage(page)
  }

  
  const handleDeleteQr = async (id) => {
    const confirmed = window.confirm(
      'Are you sure you want to delete this QR code?',
    )

    if (!confirmed) return

    try {
      await deleteQrCode(id)
      setOverviewRefreshKey((key) => key + 1)
      setSelectedQrIds((current) =>
        current.filter((selectedId) => selectedId !== String(id)),
      )

      if (String(selectedAnalyticsQr) === String(id)) {
        setSelectedAnalyticsQr('')
      }

      if (currentPage > 1 && qrCodes.length === 1) {
        setCurrentPage((page) => page - 1)
      } else {
        setListRefreshKey((key) => key + 1)
      }
    } catch (requestError) {
      setQrListError(
        requestError.message || 'Unable to delete the QR code.',
      )
    }
  }

  const handleBulkAction = async (action) => {
    const ids = selectedQrIds

    if (ids.length === 0 || isBulkManaging) return

    if (action === 'delete') {
      const confirmed = window.confirm(
        `Delete ${ids.length} selected QR code${ids.length === 1 ? '' : 's'}? This cannot be undone.`,
      )

      if (!confirmed) return
    }

    setBulkActionError('')
    setBulkActionMessage('')
    setIsBulkManaging(true)

    try {
      const response = await bulkManageQrCodes({ ids, action })

      if (
        action === 'delete' &&
        ids.includes(String(selectedAnalyticsQr))
      ) {
        setSelectedAnalyticsQr('')
      }

      setSelectedQrIds([])
      setCurrentPage(1)
      setListRefreshKey((key) => key + 1)
      setOverviewRefreshKey((key) => key + 1)
      setBulkActionMessage(response.message)
    } catch (requestError) {
      setBulkActionError(
        requestError.message || 'Unable to apply the bulk action.',
      )
    } finally {
      setIsBulkManaging(false)
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
      setGeneratedQRContent(qrContent)
      setExportError('')

      // Add the database record to the dashboard.
      // Refresh the first page to display the newly created QR code.
      setCurrentPage(1)
      setListRefreshKey((key) => key + 1)
      setOverviewRefreshKey((key) => key + 1)
      clearQrSelection()

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

  const handleQrModeChange = (mode) => {
    setQrMode(mode)

    if (mode === 'dynamic') {
      setQrType('URL')
    }
  }

    const getQrExportContent = (qr) => {
    if (qr.type !== 'DYNAMIC') {
      return qr.destination
    }

    if (!qr.short_code) {
      throw new Error('Dynamic QR code is missing its short code.')
    }

    const apiBaseUrl =
      import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'

    return new URL(`/r/${qr.short_code}`, apiBaseUrl).toString()
  }

    const handleDownloadQr = async (content, qrTitle, format) => {
    setExportError('')

    try {
      const options = {
        width: Number(qrExportSize),
        margin: 2,
        errorCorrectionLevel: 'H',
        color: {
          dark: '#111827',
          light: '#ffffff',
        },
      }

      let downloadUrl

      if (format === 'svg') {
        const svg = await QRCode.toString(content, {
          ...options,
          type: 'svg',
        })

        const blob = new Blob([svg], {
          type: 'image/svg+xml;charset=utf-8',
        })

        downloadUrl = URL.createObjectURL(blob)
      } else {
        downloadUrl = await QRCode.toDataURL(content, options)
      }

      const link = document.createElement('a')
      link.href = downloadUrl
      link.download = `${getSafeFilename(qrTitle)}.${format}`

      document.body.appendChild(link)
      link.click()
      link.remove()

      if (format === 'svg') {
        URL.revokeObjectURL(downloadUrl)
      }
    } catch {
      setExportError(`Unable to export the QR code as ${format.toUpperCase()}.`)
    }
  }

  const handleListQrDownload = (qr, format) => {
    handleDownloadQr(getQrExportContent(qr), qr.title, format)
  }

  const handleGeneratedQrDownload = (format) => {
    handleDownloadQr(generatedQRContent, generatedTitle, format)
  }

  const analyticsRangeLabels = {
    '7d': 'Last 7 days',
    '30d': 'Last 30 days',
    '90d': 'Last 90 days',
    all: 'All time',
  }

  const selectedRangeLabel = analyticsRangeLabels[analyticsRange]

  const selectedQrTotalScans = Number(analytics?.summary?.total_scans ?? 0)
  const selectedQrTodayScans = Number(analytics?.summary?.today_scans ?? 0)

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
      <Sidebar
        user={user}
        userInitials={userInitials}
        activeNav={activeNav}
        onNavigate={scrollToSection}
        onLogout={handleLogout}
      />

      <main className="main-content" id="overview">
        <DashboardHeader
          activeNav={activeNav}
          onCreateQr={() => scrollToSection('create', 'Create QR')}
        />

        <StatisticsGrid
          overview={qrOverview}
          isLoadingOverview={isLoadingOverview}
          overviewError={overviewError}
          onRetry={() => setOverviewRefreshKey((key) => key + 1)}
        />

        <section className="content-grid">
          <AnalyticsPanel
            analytics={analytics}
            qrCodes={qrCodes}
            selectedAnalyticsQr={selectedAnalyticsQr}
            analyticsRange={analyticsRange}
            isLoadingAnalytics={isLoadingAnalytics}
            analyticsError={analyticsError}
            totalScans={selectedQrTotalScans}
            todayScans={selectedQrTodayScans}
            selectedRangeLabel={selectedRangeLabel}
            onAnalyticsQrChange={setSelectedAnalyticsQr}
            onAnalyticsRangeChange={setAnalyticsRange}
          />

          <QrCodeCreatePanel
            title={title}
            destination={destination}
            qrType={qrType}
            qrMode={qrMode}
            isGenerating={isGenerating}
            error={error}
            generatedQR={generatedQR}
            generatedTitle={generatedTitle}
            qrExportSize={qrExportSize}
            exportError={exportError}
            onTitleChange={setTitle}
            onDestinationChange={setDestination}
            onQrModeChange={handleQrModeChange}
            onQrTypeChange={setQrType}
            onQrExportSizeChange={setQrExportSize}
            onSubmit={handleGenerate}
            onDownload={handleGeneratedQrDownload}
          />
        </section>

        <QrCodeManagementPanel
          data={{
            qrCodes,
            isLoadingQrs,
            qrListError,
            selectedQrIds,
            isBulkManaging,
            bulkActionError,
            bulkActionMessage,
            searchTerm,
            qrTypeFilter,
            statusFilter,
            pagination,
            currentPage,
            pageSize,
          }}
          actions={{
            onViewAll: () => setActiveNav('My QR Codes'),
            onSearchChange: handleSearchChange,
            onQrTypeFilterChange: handleQrTypeFilterChange,
            onStatusFilterChange: handleStatusFilterChange,
            onResetFilters: handleResetFilters,
            onBulkAction: handleBulkAction,
            onTogglePageSelection: handleTogglePageSelection,
            onToggleSelection: handleToggleSelection,
            onEdit: handleEditClick,
            onDownload: handleListQrDownload,
            onDelete: handleDeleteQr,
            onPageSizeChange: handlePageSizeChange,
            onPageChange: handlePageChange,
          }}
        />

        <EditQrModal
          editingQr={editingQr}
          editTitle={editTitle}
          editDestination={editDestination}
          editError={editError}
          isUpdating={isUpdating}
          onEditTitleChange={setEditTitle}
          onEditDestinationChange={setEditDestination}
          onSubmit={handleUpdateQr}
          onClose={() => setEditingQr(null)}
        />

        <footer className="footer">
          <span>&copy; 2026 SmartQR. Built with care.</span>
          <span>SmartQR <span className="footer-dot">&bull;</span> Development Preview</span>
        </footer>
      </main>
    </div>
  )
}

export default App
