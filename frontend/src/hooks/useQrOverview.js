import { useEffect, useState } from 'react'
import { getQrOverview } from '../services/qr.service'

export default function useQrOverview(user) {
  const [overview, setOverview] = useState(null)
  const [isLoadingOverview, setIsLoadingOverview] = useState(false)
  const [overviewError, setOverviewError] = useState('')
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    if (!user) return undefined

    let isMounted = true

    const fetchOverview = async () => {
      setIsLoadingOverview(true)
      setOverviewError('')

      try {
        const response = await getQrOverview()

        if (!isMounted) return

        setOverview(response.data)
      } catch (requestError) {
        if (isMounted) {
          setOverview(null)
          setOverviewError(
            requestError.message || 'Unable to load QR overview.',
          )
        }
      } finally {
        if (isMounted) {
          setIsLoadingOverview(false)
        }
      }
    }

    fetchOverview()

    return () => {
      isMounted = false
    }
  }, [user, refreshKey])

  const refreshOverview = () => {
    setRefreshKey((key) => key + 1)
  }

  const resetOverview = () => {
    setOverview(null)
    setOverviewError('')
    setIsLoadingOverview(false)
  }

  return {
    overview,
    isLoadingOverview,
    overviewError,
    refreshOverview,
    resetOverview,
  }
}
