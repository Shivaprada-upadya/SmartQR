import PropTypes from 'prop-types'
import { Button, Input, Select } from '../ui'

function QrCodeFilters({
  searchTerm,
  qrTypeFilter,
  statusFilter,
  onSearchChange,
  onQrTypeChange,
  onStatusChange,
  onReset,
}) {
  return (
    <div className="qr-filter-controls">
      <Input
        type="search"
        placeholder="Search by QR title or destination..."
        value={searchTerm}
        onChange={(event) => onSearchChange(event.target.value)}
        aria-label="Search QR codes"
      />

      <Select
        value={qrTypeFilter}
        onChange={(event) => onQrTypeChange(event.target.value)}
        aria-label="Filter by QR type"
      >
        <option value="">All QR types</option>
        <option value="static">Static</option>
        <option value="dynamic">Dynamic</option>
      </Select>

      <Select
        value={statusFilter}
        onChange={(event) => onStatusChange(event.target.value)}
        aria-label="Filter by status"
      >
        <option value="">All statuses</option>
        <option value="true">Active</option>
        <option value="false">Inactive</option>
      </Select>

      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="text-button"
        onClick={onReset}
      >
        Reset filters
      </Button>
    </div>
  )
}

QrCodeFilters.propTypes = {
  searchTerm: PropTypes.string.isRequired,
  qrTypeFilter: PropTypes.string.isRequired,
  statusFilter: PropTypes.string.isRequired,
  onSearchChange: PropTypes.func.isRequired,
  onQrTypeChange: PropTypes.func.isRequired,
  onStatusChange: PropTypes.func.isRequired,
  onReset: PropTypes.func.isRequired,
}

export default QrCodeFilters
