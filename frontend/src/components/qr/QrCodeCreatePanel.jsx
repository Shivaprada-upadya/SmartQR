import PropTypes from 'prop-types'
import { Button, Card, Input, SectionHeading, Select } from '../ui'

function QrCodeCreatePanel({
  title,
  destination,
  qrType,
  qrMode,
  isGenerating,
  error,
  generatedQR,
  generatedTitle,
  qrExportSize,
  exportError,
  onTitleChange,
  onDestinationChange,
  onQrModeChange,
  onQrTypeChange,
  onQrExportSizeChange,
  onSubmit,
  onDownload,
}) {
  return (
    <Card as="article" className="panel create-panel" id="create">
      <SectionHeading
        className="panel-heading"
        title="Create a QR Code"
        description="Generate a QR code in seconds."
        level={3}
        actions={<span className="create-icon">▦</span>}
      />

      <form onSubmit={onSubmit}>
        <label htmlFor="qr-title">QR Code Name</label>
        <Input
          id="qr-title"
          type="text"
          placeholder="e.g. My Website"
          value={title}
          onChange={(event) => onTitleChange(event.target.value)}
          maxLength={60}
        />

        <label htmlFor="qr-mode">QR Code Mode</label>
        <Select
          id="qr-mode"
          value={qrMode}
          onChange={(event) => onQrModeChange(event.target.value)}
        >
          <option value="static">Static QR Code</option>
          <option value="dynamic">Dynamic QR Code</option>
        </Select>

        <label htmlFor="qr-type">Content Type</label>
        <Select
          id="qr-type"
          value={qrType}
          onChange={(event) => onQrTypeChange(event.target.value)}
        >
          <option value="URL">Website URL</option>
          <option value="Text" disabled={qrMode === 'dynamic'}>
            Plain Text
          </option>
        </Select>

        <label htmlFor="qr-content">
          {qrType === 'URL' ? 'Website URL' : 'Text Content'}
        </label>
        <Input
          as="textarea"
          id="qr-content"
          placeholder={
            qrType === 'URL'
              ? 'https://example.com'
              : 'Enter the text for your QR code'
          }
          value={destination}
          onChange={(event) => onDestinationChange(event.target.value)}
          rows={3}
          maxLength={2000}
        />

        {error && <p className="form-error" role="alert">{error}</p>}

        <Button
          className="generate-button"
          type="submit"
          disabled={isGenerating}
          isLoading={isGenerating}
          loadingLabel="Generating QR code"
        >
          {isGenerating ? 'Generating...' : '✦  Generate QR Code'}
        </Button>
      </form>

      {generatedQR && (
        <div className="qr-result">
          <div className="qr-preview">
            <img src={generatedQR} alt={`QR code for ${generatedTitle}`} />
          </div>

          <div className="qr-result-info">
            <strong>{generatedTitle}</strong>
            <span>QR code generated successfully</span>

            <label htmlFor="qr-export-size">Export dimensions</label>
            <Select
              id="qr-export-size"
              className="period-select"
              value={qrExportSize}
              onChange={(event) => onQrExportSizeChange(event.target.value)}
            >
              <option value="280">280 × 280</option>
              <option value="512">512 × 512</option>
              <option value="1024">1024 × 1024</option>
            </Select>

            <div className="action-buttons">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => onDownload('png')}
              >
                ↓ PNG
              </Button>

              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => onDownload('svg')}
              >
                ↓ SVG
              </Button>
            </div>

            {exportError && (
              <span className="export-error">{exportError}</span>
            )}
          </div>
        </div>
      )}
    </Card>
  )
}

QrCodeCreatePanel.propTypes = {
  title: PropTypes.string.isRequired,
  destination: PropTypes.string.isRequired,
  qrType: PropTypes.oneOf(['URL', 'Text']).isRequired,
  qrMode: PropTypes.oneOf(['static', 'dynamic']).isRequired,
  isGenerating: PropTypes.bool.isRequired,
  error: PropTypes.string.isRequired,
  generatedQR: PropTypes.string.isRequired,
  generatedTitle: PropTypes.string.isRequired,
  qrExportSize: PropTypes.string.isRequired,
  exportError: PropTypes.string.isRequired,
  onTitleChange: PropTypes.func.isRequired,
  onDestinationChange: PropTypes.func.isRequired,
  onQrModeChange: PropTypes.func.isRequired,
  onQrTypeChange: PropTypes.func.isRequired,
  onQrExportSizeChange: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  onDownload: PropTypes.func.isRequired,
}

export default QrCodeCreatePanel
