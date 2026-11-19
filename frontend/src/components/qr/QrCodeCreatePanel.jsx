import PropTypes from 'prop-types'
import { Badge, Button, Card, Input, Select, SectionHeading } from '../ui'
import QrCodePreview from './QrCodePreview'

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
        className="create-heading"
        title="Configure your QR code"
        description="Choose how it works, add your content, and preview it before downloading."
        level={2}
        actions={<Badge variant="brand">QR workspace</Badge>}
      />

      <div className="create-workspace">
        <form className="create-form" onSubmit={onSubmit}>
          <Input
            id="qr-title"
            label="QR code name"
            hint="Choose a name to help you recognize this code later."
            type="text"
            placeholder="e.g. Summer event registration"
            value={title}
            onChange={(event) => onTitleChange(event.target.value)}
            maxLength={60}
            aria-required="true"
          />

          <fieldset className="qr-mode-fieldset">
            <legend className="ui-field-label">QR code mode</legend>
            <div className="qr-mode-options">
              <label className="qr-mode-option">
                <input
                  type="radio"
                  name="qr-mode"
                  value="static"
                  checked={qrMode === 'static'}
                  onChange={() => onQrModeChange('static')}
                />
                <span className="qr-mode-option__body">
                  <span className="qr-mode-option__title">Static</span>
                  <span className="qr-mode-option__description">
                    Encodes your content directly. It cannot be changed later.
                  </span>
                </span>
              </label>
              <label className="qr-mode-option">
                <input
                  type="radio"
                  name="qr-mode"
                  value="dynamic"
                  checked={qrMode === 'dynamic'}
                  onChange={() => onQrModeChange('dynamic')}
                />
                <span className="qr-mode-option__body">
                  <span className="qr-mode-option__title">
                    Dynamic <Badge variant="info">Editable destination</Badge>
                  </span>
                  <span className="qr-mode-option__description">
                    Redirects through SmartQR so you can update the destination.
                  </span>
                </span>
              </label>
            </div>
          </fieldset>

          <Select
            id="qr-type"
            label="Content type"
            hint={
              qrMode === 'dynamic'
                ? 'Dynamic codes use a website URL as their destination.'
                : 'Choose what people will see when they scan your code.'
            }
            value={qrType}
            onChange={(event) => onQrTypeChange(event.target.value)}
          >
            <option value="URL">Website URL</option>
            <option value="Text" disabled={qrMode === 'dynamic'}>
              Plain text
            </option>
          </Select>

          <Input
            as="textarea"
            id="qr-content"
            label={qrType === 'URL' ? 'Website URL' : 'Text content'}
            hint={
              qrType === 'URL'
                ? 'Include https:// for the best scanning experience.'
                : 'Add the text you want to share when the QR code is scanned.'
            }
            placeholder={
              qrType === 'URL'
                ? 'https://example.com'
                : 'Enter the text for your QR code'
            }
            value={destination}
            onChange={(event) => onDestinationChange(event.target.value)}
            rows={4}
            maxLength={2000}
            aria-required="true"
          />

          {error && (
            <p className="create-form-error" role="alert">
              {error}
            </p>
          )}

          <Button
            className="generate-button"
            type="submit"
            size="lg"
            disabled={isGenerating}
            isLoading={isGenerating}
            loadingLabel="Creating your QR code"
          >
            {isGenerating ? 'Creating QR code...' : 'Generate QR code'}
          </Button>
        </form>

        <QrCodePreview
          generatedQR={generatedQR}
          generatedTitle={generatedTitle}
          qrExportSize={qrExportSize}
          exportError={exportError}
          isGenerating={isGenerating}
          onQrExportSizeChange={onQrExportSizeChange}
          onDownload={onDownload}
        />
      </div>
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
