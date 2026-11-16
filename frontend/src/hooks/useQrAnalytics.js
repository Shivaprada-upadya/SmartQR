import { useEffect, useState } from 'react'
import { getQrAnalytics } from '../services/qr.service'

export default function useQrAnalytics(user) {
  const [selectedQr, setSelectedQr] = useState(null)
  const [range, setRange] = useState('7d')
  const [analytics, setAnalytics] = useState(null)
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(false)
  const [analyticsError, setAnalyticsError] = useState('')

  useEffect(() => {
    if (!user || !selectedQr) return undefined

    let isMounted = true

    const fetchAnalytics = async () => {
      setIsLoadingAnalytics(true)
      setAnalyticsError('')
      setAnalytics(null)

      try {
        const response = await getQrAnalytics(selectedQr, range)

        if (!isMounted) return

        setAnalytics(response.data)
      } catch (requestError) {
        if (isMounted) {
          setAnalytics(null)
          setAnalyticsError(
            requestError.message || 'Unable to load QR analytics.',
          )
        }
      } finally {
        if (isMounted) {
          setIsLoadingAnalytics(false)
        }
      }
    }

    fetchAnalytics()

    return () => {
      isMounted = false
    }
  }, [user, selectedQr, range])

  return {
    selectedQr,
    setSelectedQr,
    range,
    setRange,
    analytics,
    isLoadingAnalytics,
    analyticsError,
  }
}
