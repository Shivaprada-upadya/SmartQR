export default function useQrListControls({
  clearSelection,
  clearBulkActionFeedback,
  setSearchTerm,
  setQrTypeFilter,
  setStatusFilter,
  setPageSize,
  setCurrentPage,
}) {
  const clearQrSelection = () => {
    clearSelection()
    clearBulkActionFeedback()
  }

  const handleSearchChange = (value) => {
    clearQrSelection()
    setSearchTerm(value)
    setCurrentPage(1)
  }

  const handleQrTypeFilterChange = (value) => {
    clearQrSelection()
    setQrTypeFilter(value)
    setCurrentPage(1)
  }

  const handleStatusFilterChange = (value) => {
    clearQrSelection()
    setStatusFilter(value)
    setCurrentPage(1)
  }

  const handleResetFilters = () => {
    clearQrSelection()
    setSearchTerm('')
    setQrTypeFilter('')
    setStatusFilter('')
    setCurrentPage(1)
  }

  const handlePageSizeChange = (size) => {
    clearQrSelection()
    setPageSize(size)
    setCurrentPage(1)
  }

  const handlePageChange = (page) => {
    clearQrSelection()
    setCurrentPage(page)
  }

  return {
    handleSearchChange,
    handleQrTypeFilterChange,
    handleStatusFilterChange,
    handleResetFilters,
    handlePageSizeChange,
    handlePageChange,
  }
}
