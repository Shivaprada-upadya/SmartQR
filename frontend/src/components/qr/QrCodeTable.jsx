import PropTypes from 'prop-types'

const qrCodeShape = PropTypes.shape({
  id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  title: PropTypes.string.isRequired,
  destination: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired,
  status: PropTypes.string.isRequired,
  created: PropTypes.string.isRequired,
})

function QrCodeActions({ item, onEdit, onDownload, onDelete }) {
  return (
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
  )
}

function QrCodeMobileCard({
  item,
  isSelected,
  isDisabled,
  onToggleSelection,
  onEdit,
  onDownload,
  onDelete,
}) {
  return (
    <li className="qr-mobile-card">
      <div className="qr-mobile-card-heading">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => onToggleSelection(item.id)}
          disabled={isDisabled}
          aria-label={`Select ${item.title}`}
        />
        <div className="qr-mobile-card-title">
          <div className="qr-name">
            <span className="mini-qr" aria-hidden="true">▦</span>
            <strong>{item.title}</strong>
          </div>
          <div className="qr-mobile-badges">
            <span className="type-badge">{item.type}</span>
            <span className={`status-badge ${item.status.toLowerCase()}`}>
              <span></span>{item.status}
            </span>
          </div>
        </div>
      </div>

      <dl className="qr-mobile-card-details">
        <div>
          <dt>Destination / Content</dt>
          <dd>{item.destination}</dd>
        </div>
        <div>
          <dt>Created</dt>
          <dd>{item.created}</dd>
        </div>
      </dl>

      <QrCodeActions
        item={item}
        onEdit={onEdit}
        onDownload={onDownload}
        onDelete={onDelete}
      />
    </li>
  )
}

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
    <>
      <div className="qr-desktop-view">
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
                <td colSpan="7">
                  No QR codes found. Create your first QR code!
                </td>
              </tr>
            )}

            {!isLoadingQrs &&
              !qrListError &&
              qrCodes.map((item) => (
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
                      <span className="mini-qr" aria-hidden="true">▦</span>
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
                    <QrCodeActions
                      item={item}
                      onEdit={onEdit}
                      onDownload={onDownload}
                      onDelete={onDelete}
                    />
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      <div className="qr-mobile-view">
        <label className="qr-mobile-select-all">
          <input
            type="checkbox"
            checked={allPageIdsSelected}
            onChange={onTogglePageSelection}
            disabled={
              qrCodes.length === 0 ||
              isLoadingQrs ||
              isBulkManaging
            }
          />
          <span>Select all QR codes on this page</span>
        </label>

        {isLoadingQrs && (
          <p className="qr-mobile-message" role="status">
            Loading QR codes...
          </p>
        )}
        {!isLoadingQrs && qrListError && (
          <p className="qr-mobile-message" role="alert">
            {qrListError}
          </p>
        )}
        {!isLoadingQrs && !qrListError && qrCodes.length === 0 && (
          <p className="qr-mobile-message">
            No QR codes found. Create your first QR code!
          </p>
        )}
        {!isLoadingQrs && !qrListError && qrCodes.length > 0 && (
          <ul className="qr-mobile-list" aria-label="QR codes">
            {qrCodes.map((item) => (
              <QrCodeMobileCard
                key={item.id}
                item={item}
                isSelected={selectedQrIds.includes(String(item.id))}
                isDisabled={isBulkManaging || isLoadingQrs}
                onToggleSelection={onToggleSelection}
                onEdit={onEdit}
                onDownload={onDownload}
                onDelete={onDelete}
              />
            ))}
          </ul>
        )}
      </div>
    </>
  )
}

QrCodeActions.propTypes = {
  item: qrCodeShape.isRequired,
  onEdit: PropTypes.func.isRequired,
  onDownload: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
}

QrCodeMobileCard.propTypes = {
  item: qrCodeShape.isRequired,
  isSelected: PropTypes.bool.isRequired,
  isDisabled: PropTypes.bool.isRequired,
  onToggleSelection: PropTypes.func.isRequired,
  onEdit: PropTypes.func.isRequired,
  onDownload: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
}

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
