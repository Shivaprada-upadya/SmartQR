import PropTypes from 'prop-types'

function QrCodeTable({
  qrCodes,
  isLoadingQrs,
  qrListError,
  selectedQrIds,
  isBulkManaging,
  onTogglePageSelection,
  onToggleSelection,
  onEdit,
  onDownload,
  onDelete,
}) {
  const allPageIdsSelected =
    qrCodes.length > 0 &&
    qrCodes.every((item) => selectedQrIds.includes(String(item.id)))

  return (
    <table aria-label="QR codes">
      <thead>
        <tr>
          <th scope="col" className="selection-column">
            <input
              type="checkbox"
              checked={allPageIdsSelected}
              onChange={onTogglePageSelection}
              disabled={
                qrCodes.length === 0 ||
                isLoadingQrs ||
                isBulkManaging
              }
              aria-label="Select all QR codes on this page"
            />
          </th>
          <th scope="col">QR CODE</th>
          <th scope="col">CONTENT</th>
          <th scope="col">TYPE</th>
          <th scope="col">STATUS</th>
          <th scope="col">CREATED</th>
          <th scope="col">ACTIONS</th>
        </tr>
      </thead>
      <tbody>
        {isLoadingQrs && (
          <tr>
            <td colSpan="7">Loading QR codes...</td>
          </tr>
        )}

        {!isLoadingQrs && qrListError && (
          <tr>
            <td colSpan="7">{qrListError}</td>
          </tr>
        )}

        {!isLoadingQrs && !qrListError && qrCodes.length === 0 && (
          <tr>
            <td colSpan="7">No QR codes found. Create your first QR code!</td>
          </tr>
        )}

        {!isLoadingQrs && !qrListError && qrCodes.map((item) => (
          <tr key={item.id}>
            <td className="selection-column">
              <input
                type="checkbox"
                checked={selectedQrIds.includes(String(item.id))}
                onChange={() => onToggleSelection(item.id)}
                disabled={isBulkManaging || isLoadingQrs}
                aria-label={`Select ${item.title}`}
              />
            </td>
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
                  onClick={() => onEdit(item)}
                  aria-label={`Edit ${item.title}`}
                  title="Edit QR code"
                >
                  Edit
                </button>

                <button
                  type="button"
                  className="edit-button"
                  onClick={() => onDownload(item, 'png')}
                  aria-label={`Download PNG for ${item.title}`}
                  title="Download PNG"
                >
                  PNG
                </button>

                <button
                  type="button"
                  className="edit-button"
                  onClick={() => onDownload(item, 'svg')}
                  aria-label={`Download SVG for ${item.title}`}
                  title="Download SVG"
                >
                  SVG
                </button>

                <button
                  type="button"
                  className="delete-button"
                  onClick={() => onDelete(item.id)}
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

QrCodeTable.propTypes = {
  qrCodes: PropTypes.arrayOf(qrCodeShape).isRequired,
  isLoadingQrs: PropTypes.bool.isRequired,
  qrListError: PropTypes.string.isRequired,
  selectedQrIds: PropTypes.arrayOf(PropTypes.string).isRequired,
  isBulkManaging: PropTypes.bool.isRequired,
  onTogglePageSelection: PropTypes.func.isRequired,
  onToggleSelection: PropTypes.func.isRequired,
  onEdit: PropTypes.func.isRequired,
  onDownload: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
}

export default QrCodeTable
