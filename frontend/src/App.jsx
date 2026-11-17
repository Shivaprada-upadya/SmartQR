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
import useQrEdit from './hooks/useQrEdit'
import useSession from './hooks/useSession'
import useQrSelection from './hooks/useQrSelection'
import useQrManagement from './hooks/useQrManagement'
import useQrListControls from './hooks/useQrListControls'
import useDashboardNavigation from './hooks/useDashboardNavigation'

function App() {
  const { user, setUser, isCheckingSession, clearSession } = useSession()
  const { activeNav, setActiveNav, userInitials, scrollToSection } =
    useDashboardNavigation(user)
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
    selectedQrIds,
    setSelectedQrIds,
    clearSelection,
    handleTogglePageSelection,
    handleToggleSelection,
  } = useQrSelection(qrCodes)
  const {
    editingQr,
    editTitle,
    editDestination,
    editError,
    isUpdating,
    setEditTitle,
    setEditDestination,
    closeEdit,
    handleEditClick,
    handleUpdateQr,
  } = useQrEdit(setQrCodes)
  const {
    overview: qrOverview,
    isLoadingOverview,
    overviewError,
    refreshOverview,
    resetOverview,
  } = useQrOverview(user)
  const {
    isBulkManaging,
    bulkActionError,
    bulkActionMessage,
    deleteConfirmation,
    deleteConfirmationError,
    isDeletingQr,
    clearBulkActionFeedback,
    handleDeleteQr,
    handleConfirmDelete,
    handleBulkAction,
    closeDeleteConfirmation,
  } = useQrManagement({
    qrCodes,
    selectedQrIds,
    setSelectedQrIds,
    selectedAnalyticsQr,
    setSelectedAnalyticsQr,
    currentPage,
    setCurrentPage,
    refreshQrCodes,
    refreshOverview,
    setQrListError,
  })
  const {
    handleSearchChange,
    handleQrTypeFilterChange,
    handleStatusFilterChange,
    handleResetFilters,
    handlePageSizeChange,
    handlePageChange,
  } = useQrListControls({
    clearSelection,
    clearBulkActionFeedback,
    setSearchTerm,
    setQrTypeFilter,
    setStatusFilter,
    setPageSize,
    setCurrentPage,
  })

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
    clearBulkActionFeedback()
    setExportError('')
  })
  const handleLogout = () => {
    clearSession()
    clearSelection()
    resetOverview()
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
          onClose={closeEdit}
        />

        <DeleteConfirmationModal
          confirmation={deleteConfirmation}
          error={deleteConfirmationError}
          isDeleting={isDeletingQr || isBulkManaging}
          onConfirm={handleConfirmDelete}
          onClose={closeDeleteConfirmation}
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
