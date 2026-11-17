import { useEffect, useState } from 'react'
import './App.css'

import Auth from './components/Auth'
import AnalyticsPanel from './components/dashboard/AnalyticsPanel'
import StatisticsGrid from './components/dashboard/StatisticsGrid'
import DashboardHeader from './components/layout/DashboardHeader'
import Sidebar from './components/layout/Sidebar'
import DeleteConfirmationModal from './components/qr/DeleteConfirmationModal'
import EditQrModal from './components/qr/EditQrModal'
import QrCodeCreatePanel from './components/qr/QrCodeCreatePanel'
import QrCodeManagementPanel from './components/qr/QrCodeManagementPanel'
import useQrCreation from './hooks/useQrCreation'
import useQrAnalytics from './hooks/useQrAnalytics'
import useQrExport from './hooks/useQrExport'
import useQrOverview from './hooks/useQrOverview'
import useQrList from './hooks/useQrList'
import { getToken } from './services/api'
import { getCurrentUser, logout } from './services/auth.service'
import {
  bulkManageQrCodes,
  deleteQrCode,
  updateQrCode,
} from './services/qr.service'

function App() {
  
  const [user, setUser] = useState(null)
  const [isCheckingSession, setIsCheckingSession] = useState(true)
  
  const [activeNav, setActiveNav] = useState('Overview')
  const [selectedQrIds, setSelectedQrIds] = useState([])
  const [isBulkManaging, setIsBulkManaging] = useState(false)
  const [bulkActionError, setBulkActionError] = useState('')
  const [bulkActionMessage, setBulkActionMessage] = useState('')
  const {
    selectedQr: selectedAnalyticsQr,
    setSelectedQr: setSelectedAnalyticsQr,
    range: analyticsRange,
    setRange: setAnalyticsRange,
    analytics,
    isLoadingAnalytics,
    analyticsError,
  } = useQrAnalytics(user)
  const {
    qrCodes,
    setQrCodes,
    isLoadingQrs,
    qrListError,
    setQrListError,
    currentPage,
    setCurrentPage,
    pageSize,
    setPageSize,
    searchTerm,
    setSearchTerm,
    qrTypeFilter,
    setQrTypeFilter,
    statusFilter,
    setStatusFilter,
    pagination,
    refreshQrCodes,
  } = useQrList(user, setSelectedAnalyticsQr)
  const {
    overview: qrOverview,
    isLoadingOverview,
    overviewError,
    refreshOverview,
    resetOverview,
  } = useQrOverview(user)
  const [editingQr, setEditingQr] = useState(null)
  const [deleteConfirmation, setDeleteConfirmation] = useState(null)
  const [deleteConfirmationError, setDeleteConfirmationError] = useState('')
  const [isDeletingQr, setIsDeletingQr] = useState(false)
  const [editTitle, setEditTitle] = useState('')
  const [editDestination, setEditDestination] = useState('')
  const [editError, setEditError] = useState('')
  const [isUpdating, setIsUpdating] = useState(false)

  const {
    qrExportSize,
    setQrExportSize,
    exportError,
    setExportError,
    downloadQr,
    downloadListQr,
  } = useQrExport()

  const {
    title,
    setTitle,
    destination,
    setDestination,
    qrType,
    setQrType,
    qrMode,
    handleQrModeChange,
    generatedQR,
    generatedTitle,
    generatedQRContent,
    error,
    isGenerating,
    handleGenerate,
  } = useQrCreation(() => {
    setCurrentPage(1)
    refreshQrCodes()
    refreshOverview()
    setSelectedQrIds([])
    setBulkActionError('')
    setBulkActionMessage('')
    setExportError('')
  })
  
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

  const handleLogout = () => {
    logout()
    setUser(null)
    setSelectedQrIds([])
    resetOverview()
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

  
  const handleDeleteQr = (id) => {
    const qrCode = qrCodes.find((item) => String(item.id) === String(id))

    setDeleteConfirmationError('')
    setDeleteConfirmation({ type: 'single', id, title: qrCode?.title })
  }

  const handleConfirmDelete = async () => {
    if (!deleteConfirmation || isDeletingQr || isBulkManaging) return

    setDeleteConfirmationError('')
    setIsDeletingQr(true)

    if (deleteConfirmation.type === 'single') {
      const { id } = deleteConfirmation

      try {
        await deleteQrCode(id)
        refreshOverview()
        setSelectedQrIds((current) =>
          current.filter((selectedId) => selectedId !== String(id)),
        )

        if (String(selectedAnalyticsQr) === String(id)) {
          setSelectedAnalyticsQr('')
        }

        if (currentPage > 1 && qrCodes.length === 1) {
          setCurrentPage((page) => page - 1)
        } else {
          refreshQrCodes()
        }

        setDeleteConfirmation(null)
      } catch (requestError) {
        const message = requestError.message || 'Unable to delete the QR code.'
        setDeleteConfirmationError(message)
        setQrListError(message)
      } finally {
        setIsDeletingQr(false)
      }

      return
    }

    const ids = deleteConfirmation.ids
    setBulkActionError('')
    setBulkActionMessage('')
    setIsBulkManaging(true)

    try {
      const response = await bulkManageQrCodes({ ids, action: 'delete' })

      if (ids.includes(String(selectedAnalyticsQr))) {
        setSelectedAnalyticsQr('')
      }

      setSelectedQrIds([])
      setCurrentPage(1)
      refreshQrCodes()
      refreshOverview()
      setBulkActionMessage(response.message)
      setDeleteConfirmation(null)
    } catch (requestError) {
      const message =
        requestError.message || 'Unable to apply the bulk action.'
      setDeleteConfirmationError(message)
      setBulkActionError(message)
    } finally {
      setIsDeletingQr(false)
      setIsBulkManaging(false)
    }
  }

  const handleBulkAction = async (action) => {
    const ids = selectedQrIds

    if (ids.length === 0 || isBulkManaging) return

    if (action === 'delete') {
      setDeleteConfirmationError('')
      setDeleteConfirmation({ type: 'bulk', ids })
      return
    }

    setBulkActionError('')
    setBulkActionMessage('')
    setIsBulkManaging(true)

    try {
      const response = await bulkManageQrCodes({ ids, action })

      setSelectedQrIds([])
      setCurrentPage(1)
      refreshQrCodes()
      refreshOverview()
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
 
  const scrollToSection = (target, label) => {
    setActiveNav(label)
    document.getElementById(target)?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    })
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
          onRetry={refreshOverview}
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
            onDownload={(format) =>
              downloadQr(generatedQRContent, generatedTitle, format)
            }
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
            onDownload: downloadListQr,
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

        <DeleteConfirmationModal
          confirmation={deleteConfirmation}
          error={deleteConfirmationError}
          isDeleting={isDeletingQr || isBulkManaging}
          onConfirm={handleConfirmDelete}
          onClose={() => {
            if (isDeletingQr || isBulkManaging) return
            setDeleteConfirmation(null)
            setDeleteConfirmationError('')
          }}
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
