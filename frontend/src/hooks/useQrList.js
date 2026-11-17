import { useEffect, useState } from 'react'
import { getQrCodes } from '../services/qr.service'

const EMPTY_PAGINATION = {
  page: 1,
  limit: 5,
  totalRecords: 0,
  totalPages: 0,
  hasNextPage: false,
  hasPreviousPage: false,
}

export default function useQrList(user, setSelectedAnalyticsQr) {
  const [qrCodes, setQrCodes] = useState([])
  const [qrCodesUser, setQrCodesUser] = useState(user)
  const [isLoadingQrs, setIsLoadingQrs] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(5)
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('')
  const [qrTypeFilter, setQrTypeFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [refreshKey, setRefreshKey] = useState(0)
  const [pagination, setPagination] = useState(EMPTY_PAGINATION)
  const [qrListError, setQrListError] = useState('')

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedSearchTerm(searchTerm)
    }, 300)

    return () => window.clearTimeout(timeoutId)
  }, [searchTerm])

  useEffect(() => {
    if (!user || searchTerm !== debouncedSearchTerm) return undefined

    let isMounted = true

    const fetchQrCodes = async () => {
      setIsLoadingQrs(true)
      setQrListError('')

      try {
        const response = await getQrCodes({
          page: currentPage,
          limit: pageSize,
          search: debouncedSearchTerm,
          qrType: qrTypeFilter || undefined,
          isActive: statusFilter === '' ? undefined : statusFilter,
          sortBy: 'createdAt',
          sortOrder: 'desc',
        })

        if (!isMounted) return

        const formattedQrCodes = response.data.qrCodes.map((item) => ({
          id: item.id,
          title: item.title,
          destination: item.destination,
          short_code: item.short_code,
          type: item.qr_type.toUpperCase(),
          status: item.is_active ? 'Active' : 'Inactive',
          created: new Date(item.created_at).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
          }),
        }))

        setQrCodes(formattedQrCodes)
        setQrCodesUser(user)
        setPagination(response.pagination)
        setSelectedAnalyticsQr((current) => {
          if (current) {
            return current
          }

          return formattedQrCodes.length > 0
            ? String(formattedQrCodes[0].id)
            : ''
        })
      } catch (requestError) {
        if (isMounted) {
          setQrListError(requestError.message || 'Unable to load QR codes.')
        }
      } finally {
        if (isMounted) {
          setIsLoadingQrs(false)
        }
      }
    }

    fetchQrCodes()

    return () => {
      isMounted = false
    }
  }, [
    user,
    currentPage,
    pageSize,
    refreshKey,
    searchTerm,
    debouncedSearchTerm,
    qrTypeFilter,
    statusFilter,
    setSelectedAnalyticsQr,
  ])

  const refreshQrCodes = () => {
    setRefreshKey((key) => key + 1)
  }

  const hasCurrentUserData = Boolean(user && qrCodesUser === user)

  return {
    qrCodes: hasCurrentUserData ? qrCodes : [],
    setQrCodes,
    isLoadingQrs,
    qrListError,
    setQrListError,
    currentPage,
    setCurrentPage,
    pageSize,
    setPageSize,
    searchTerm,
    setSearchTerm,
    qrTypeFilter,
    setQrTypeFilter,
    statusFilter,
    setStatusFilter,
    pagination: hasCurrentUserData ? pagination : EMPTY_PAGINATION,
    refreshQrCodes,
  }
}
