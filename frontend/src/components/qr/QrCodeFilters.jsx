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
      <div className="qr-filter-search">
        <Input
          id="qr-search"
          label="Search"
          type="search"
          placeholder="Title or destination"
          value={searchTerm}
          onChange={(event) => onSearchChange(event.target.value)}
        />
      </div>

      <div className="qr-filter-field">
        <Select
          id="qr-type-filter"
          label="QR type"
          value={qrTypeFilter}
          onChange={(event) => onQrTypeChange(event.target.value)}
        >
          <option value="">All types</option>
          <option value="static">Static</option>
          <option value="dynamic">Dynamic</option>
        </Select>
      </div>

      <div className="qr-filter-field">
        <Select
          id="qr-status-filter"
          label="Status"
          value={statusFilter}
          onChange={(event) => onStatusChange(event.target.value)}
        >
          <option value="">All statuses</option>
          <option value="true">Active</option>
          <option value="false">Inactive</option>
        </Select>
      </div>

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
