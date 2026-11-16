import PropTypes from 'prop-types'

function QrCodePagination({
  qrCodesCount,
  pagination,
  currentPage,
  pageSize,
  isLoadingQrs,
  onPageSizeChange,
  onPageChange,
}) {
  return (
    <div className="pagination-controls">
      <div className="pagination-info">
        Showing {qrCodesCount} of {pagination.totalRecords} QR codes
        <span>
          Page {pagination.totalPages === 0 ? 0 : currentPage} of{' '}
          {pagination.totalPages}
        </span>
      </div>

      <div className="pagination-actions">
        <label htmlFor="page-size">Rows per page:</label>
        <select
          id="page-size"
          value={pageSize}
          onChange={(event) => onPageSizeChange(Number(event.target.value))}
        >
          <option value={5}>5</option>
          <option value={10}>10</option>
          <option value={20}>20</option>
        </select>

        <button
          type="button"
          className="pagination-button"
          disabled={!pagination.hasPreviousPage || isLoadingQrs}
          onClick={() => onPageChange(currentPage - 1)}
        >
          Previous
        </button>

        <button
          type="button"
          className="pagination-button"
          disabled={!pagination.hasNextPage || isLoadingQrs}
          onClick={() => onPageChange(currentPage + 1)}
        >
          Next
        </button>
      </div>
    </div>
  )
}

QrCodePagination.propTypes = {
  qrCodesCount: PropTypes.number.isRequired,
  pagination: PropTypes.shape({
    totalRecords: PropTypes.number.isRequired,
    totalPages: PropTypes.number.isRequired,
    hasPreviousPage: PropTypes.bool.isRequired,
    hasNextPage: PropTypes.bool.isRequired,
  }).isRequired,
  currentPage: PropTypes.number.isRequired,
  pageSize: PropTypes.number.isRequired,
  isLoadingQrs: PropTypes.bool.isRequired,
  onPageSizeChange: PropTypes.func.isRequired,
  onPageChange: PropTypes.func.isRequired,
}

export default QrCodePagination
