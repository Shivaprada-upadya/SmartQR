import {
  getDynamicQrByShortCode,
  recordQrScan,
} from '../services/qr.service.js'

const getDeviceType = (userAgent) => {
  if (/ipad|tablet/i.test(userAgent)) return 'tablet'
  if (/mobile|android|iphone/i.test(userAgent)) return 'mobile'
  if (userAgent) return 'desktop'
  return 'unknown'
}

const getBrowser = (userAgent) => {
  if (/edg/i.test(userAgent)) return 'Edge'
  if (/opr|opera/i.test(userAgent)) return 'Opera'
  if (/chrome/i.test(userAgent)) return 'Chrome'
  if (/firefox/i.test(userAgent)) return 'Firefox'
  if (/safari/i.test(userAgent)) return 'Safari'
  return 'Unknown'
}

const getOperatingSystem = (userAgent) => {
  if (/windows/i.test(userAgent)) return 'Windows'
  if (/android/i.test(userAgent)) return 'Android'
  if (/iphone|ipad|ios/i.test(userAgent)) return 'iOS'
  if (/mac os/i.test(userAgent)) return 'macOS'
  if (/linux/i.test(userAgent)) return 'Linux'
  return 'Unknown'
}

export const redirectQr = async (req, res) => {
  const qrCode = await getDynamicQrByShortCode(req.params.shortCode)

  const userAgent = req.get('user-agent') || ''

  await recordQrScan(qrCode.id, {
    deviceType: getDeviceType(userAgent),
    browser: getBrowser(userAgent),
    operatingSystem: getOperatingSystem(userAgent),
    referrer: req.get('referer') || null,
  })

  return res.redirect(302, qrCode.destination)
}