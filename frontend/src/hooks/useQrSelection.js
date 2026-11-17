import { useState } from 'react'

export default function useQrSelection(qrCodes) {
  const [selectedQrIds, setSelectedQrIds] = useState([])

  const clearSelection = () => {
    setSelectedQrIds([])
  }

  const handleTogglePageSelection = () => {
    const pageIds = qrCodes.map((item) => String(item.id))
    const allSelected = pageIds.every((id) => selectedQrIds.includes(id))

    setSelectedQrIds((current) =>
      allSelected
        ? current.filter((id) => !pageIds.includes(id))
        : [...new Set([...current, ...pageIds])],
    )
  }

  const handleToggleSelection = (id) => {
    const selectedId = String(id)

    setSelectedQrIds((current) =>
      current.includes(selectedId)
        ? current.filter((id) => id !== selectedId)
        : [...current, selectedId],
    )
  }

  return {
    selectedQrIds,
    setSelectedQrIds,
    clearSelection,
    handleTogglePageSelection,
    handleToggleSelection,
  }
}
