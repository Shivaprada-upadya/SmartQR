import { createQrCode, getUserQrCodes, getQrCodeById, updateQrCode,deleteQrCode, getQrAnalytics } from "../services/qr.service.js";
export const createQr = async (req, res) => {
  const qrCode = await createQrCode({
    ...req.body,
    userId: req.user.userId,
  });

  res.status(201).json({
    success: true,
    message: "QR code created successfully",
    data: {
      qrCode,
    },
  });
};

export const getQrCodes = async (req, res) => {
  const { page, limit } = req.validatedQuery

  const { qrCodes, totalRecords } = await getUserQrCodes(
    req.user.userId,
    { page, limit },
  )

  const totalPages = Math.ceil(totalRecords / limit)

  res.status(200).json({
    success: true,
    message: 'QR codes retrieved successfully',
    results: qrCodes.length,
    data: {
      qrCodes,
    },
    pagination: {
      page,
      limit,
      totalRecords,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    },
  })
}

export const getQrCode = async (req, res) => {
  const qrCode = await getQrCodeById(
    req.params.id,
    req.user.userId,
  )

  res.status(200).json({
    success: true,
    message: 'QR code retrieved successfully',
    data: {
      qrCode,
    },
  })
}


export const updateQr = async (req, res) => {
  const qrCode = await updateQrCode(
    req.params.id,
    req.user.userId,
    req.body,
  )

  res.status(200).json({
    success: true,
    message: 'QR code updated successfully',
    data: {
      qrCode,
    },
  })
}

export const deleteQr = async (req, res) => {
  await deleteQrCode(req.params.id, req.user.userId)

  res.status(200).json({
    success: true,
    message: 'QR code deleted successfully',
  })
}

export const getQrAnalyticsController = async (req, res) => {
  const analytics = await getQrAnalytics(
    req.params.id,
    req.user.userId,
  )

  res.status(200).json({
    success: true,
    message: 'QR analytics retrieved successfully',
    data: analytics,
  })
}