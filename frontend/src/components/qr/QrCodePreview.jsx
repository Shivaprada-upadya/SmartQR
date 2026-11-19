import PropTypes from 'prop-types'
import { Badge, Button, Card, EmptyState, Select } from '../ui'
import Icon from '../layout/Icon'

function QrCodePreview({
  generatedQR,
  generatedTitle,
  qrExportSize,
  exportError,
  isGenerating,
  onQrExportSizeChange,
  onDownload,
}) {
  return (
    <Card
      as="section"
      variant="subtle"
      className="qr-preview-card"
      aria-label="QR code preview"
    >
      <div className="qr-preview-card__header">
        <div>
          <h3>Live preview</h3>
          <p>Your generated code will appear here.</p>
        </div>
        {generatedQR && <Badge variant="success">Ready to download</Badge>}
      </div>

      {generatedQR ? (
        <div className="qr-preview-result" aria-live="polite">
          <div className="qr-preview-image">
            <img src={generatedQR} alt={`QR code for ${generatedTitle}`} />
          </div>
          <div className="qr-preview-details">
            <div>
              <h4>{generatedTitle}</h4>
              <p>Scan to open the encoded content.</p>
            </div>

            <Select
              id="qr-export-size"
              label="Export dimensions"
              hint="Higher resolution is best for print."
              value={qrExportSize}
              onChange={(event) => onQrExportSizeChange(event.target.value)}
            >
              <option value="280">280 × 280 px</option>
              <option value="512">512 × 512 px</option>
              <option value="1024">1024 × 1024 px</option>
            </Select>

            <div className="qr-export-actions">
              <Button
                type="button"
                variant="primary"
                onClick={() => onDownload('png')}
              >
                Download PNG
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => onDownload('svg')}
              >
                Download SVG
              </Button>
            </div>
            {exportError && (
              <p className="qr-export-feedback" role="alert">
                {exportError}
              </p>
            )}
          </div>
        </div>
      ) : (
        <EmptyState
          className="qr-preview-empty"
          icon={<Icon name="qr" size={25} />}
          title={isGenerating ? 'Creating your QR code' : 'Your preview is waiting'}
          description={
            isGenerating
              ? 'We are saving your code and preparing its preview.'
              : 'Complete the form and generate a code to see it here.'
          }
        />
      )}
    </Card>
  )
}

QrCodePreview.propTypes = {
  generatedQR: PropTypes.string.isRequired,
  generatedTitle: PropTypes.string.isRequired,
  qrExportSize: PropTypes.string.isRequired,
  exportError: PropTypes.string.isRequired,
  isGenerating: PropTypes.bool.isRequired,
  onQrExportSizeChange: PropTypes.func.isRequired,
  onDownload: PropTypes.func.isRequired,
}

export default QrCodePreview
