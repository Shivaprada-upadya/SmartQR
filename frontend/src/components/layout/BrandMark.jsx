function BrandMark() {
  return (
    <a className="brand" href="#overview" aria-label="SmartQR overview">
      <span className="brand-icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none">
          <path d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4z" />
          <path d="M14 14h2v2h-2zM18 14h2M14 18h2M18 18v2" />
        </svg>
      </span>
      <span className="brand-wordmark">
        Smart<span className="brand-accent">QR</span>
      </span>
    </a>
  )
}

export default BrandMark
