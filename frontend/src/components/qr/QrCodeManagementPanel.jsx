import PropTypes from 'prop-types'
import { Button, Card, SectionHeading } from '../ui'
import QrCodeFilters from './QrCodeFilters'
import QrCodePagination from './QrCodePagination'
import QrCodeTable from './QrCodeTable'

function QrCodeManagementPanel({ data, actions }) {
  const {
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
  } = data

  return (
    <Card
      as="section"
      className="panel recent-panel"
      padding="none"
      id="recent"
    >
      <SectionHeading
        className="panel-heading recent-heading"
        title="Recent QR Codes"
        description="View and manage your recently created QR codes."
        level={3}
        actions={(
          <Button
            variant="ghost"
            size="sm"
            className="text-button"
            onClick={actions.onViewAll}
          >
            View all <span>→</span>
          </Button>
        )}
      />

      <QrCodeFilters
        searchTerm={searchTerm}
        qrTypeFilter={qrTypeFilter}
        statusFilter={statusFilter}
        onSearchChange={actions.onSearchChange}
        onQrTypeChange={actions.onQrTypeFilterChange}
        onStatusChange={actions.onStatusFilterChange}
        onReset={actions.onResetFilters}
      />

      <div className="bulk-action-controls">
        <span className="bulk-action-count" aria-live="polite">
          {selectedQrIds.length} selected on this page
        </span>
        <div className="bulk-action-buttons" aria-label="Bulk actions">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => actions.onBulkAction('activate')}
            disabled={
              selectedQrIds.length === 0 ||
              isBulkManaging ||
              isLoadingQrs
            }
          >
            Activate
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => actions.onBulkAction('deactivate')}
            disabled={
              selectedQrIds.length === 0 ||
              isBulkManaging ||
              isLoadingQrs
            }
          >
            Deactivate
          </Button>
          <Button
            type="button"
            variant="danger"
            size="sm"
            onClick={() => actions.onBulkAction('delete')}
            disabled={
              selectedQrIds.length === 0 ||
              isBulkManaging ||
              isLoadingQrs
            }
          >
            Delete selected
          </Button>
        </div>
        {bulkActionError && (
          <p className="bulk-action-error" role="alert">
            {bulkActionError}
          </p>
        )}
        {bulkActionMessage && (
          <p className="bulk-action-message" role="status">
            {bulkActionMessage}
          </p>
        )}
      </div>

      <div
        className="table-wrapper"
        role="region"
        aria-label="QR code list"
        tabIndex={0}
      >
        <QrCodeTable
          qrCodes={qrCodes}
          isLoadingQrs={isLoadingQrs}
          qrListError={qrListError}
          selectedQrIds={selectedQrIds}
          isBulkManaging={isBulkManaging}
          onTogglePageSelection={actions.onTogglePageSelection}
          onToggleSelection={actions.onToggleSelection}
          onEdit={actions.onEdit}
          onDownload={actions.onDownload}
          onDelete={actions.onDelete}
        />
        <QrCodePagination
          qrCodesCount={qrCodes.length}
          pagination={pagination}
          currentPage={currentPage}
          pageSize={pageSize}
          isLoadingQrs={isLoadingQrs}
          onPageSizeChange={actions.onPageSizeChange}
          onPageChange={actions.onPageChange}
        />
      </div>
    </Card>
  )
}

const qrCodeShape = PropTypes.shape({
  id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  title: PropTypes.string.isRequired,
  destination: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired,
  status: PropTypes.string.isRequired,
  created: PropTypes.string.isRequired,
})

QrCodeManagementPanel.propTypes = {
  data: PropTypes.shape({
    qrCodes: PropTypes.arrayOf(qrCodeShape).isRequired,
    isLoadingQrs: PropTypes.bool.isRequired,
    qrListError: PropTypes.string.isRequired,
    selectedQrIds: PropTypes.arrayOf(PropTypes.string).isRequired,
    isBulkManaging: PropTypes.bool.isRequired,
    bulkActionError: PropTypes.string.isRequired,
    bulkActionMessage: PropTypes.string.isRequired,
    searchTerm: PropTypes.string.isRequired,
    qrTypeFilter: PropTypes.string.isRequired,
    statusFilter: PropTypes.string.isRequired,
    pagination: PropTypes.shape({
      totalRecords: PropTypes.number.isRequired,
      totalPages: PropTypes.number.isRequired,
      hasPreviousPage: PropTypes.bool.isRequired,
      hasNextPage: PropTypes.bool.isRequired,
    }).isRequired,
    currentPage: PropTypes.number.isRequired,
    pageSize: PropTypes.number.isRequired,
  }).isRequired,
  actions: PropTypes.shape({
    onViewAll: PropTypes.func.isRequired,
    onSearchChange: PropTypes.func.isRequired,
    onQrTypeFilterChange: PropTypes.func.isRequired,
    onStatusFilterChange: PropTypes.func.isRequired,
    onResetFilters: PropTypes.func.isRequired,
    onBulkAction: PropTypes.func.isRequired,
    onTogglePageSelection: PropTypes.func.isRequired,
    onToggleSelection: PropTypes.func.isRequired,
    onEdit: PropTypes.func.isRequired,
    onDownload: PropTypes.func.isRequired,
    onDelete: PropTypes.func.isRequired,
    onPageSizeChange: PropTypes.func.isRequired,
    onPageChange: PropTypes.func.isRequired,
  }).isRequired,
}

export default QrCodeManagementPanel
