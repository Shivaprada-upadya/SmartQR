
import { randomBytes } from 'node:crypto'
import pool from '../config/database.js'

export const createQrCode = async ({
  userId,
  title,
  destination,
  qrType,
  expiresAt,
}) => {
  // Static QR codes do not need short codes.
  // Dynamic QR codes need unique short codes.
  const maxAttempts = qrType === 'dynamic' ? 5 : 1

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const shortCode =
      qrType === 'dynamic'
        ? randomBytes(6).toString('base64url')
        : null

    try {
      const result = await pool.query(
        `INSERT INTO qr_codes
          (user_id, title, destination, qr_type, short_code, expires_at)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING
          id,
          user_id,
          title,
          destination,
          qr_type,
          short_code,
          is_active,
          expires_at,
          created_at,
          updated_at`,
        [
          userId,
          title,
          destination,
          qrType,
          shortCode,
          expiresAt || null,
        ],
      )

      return result.rows[0]
    } catch (error) {
      // Retry if a generated dynamic short code already exists.
      if (
        error.code === '23505' &&
        qrType === 'dynamic' &&
        attempt < maxAttempts
      ) {
        continue
      }

      throw error
    }
  }

  const error = new Error('Unable to generate a unique short code')
  error.statusCode = 503
  throw error
}


export const getUserQrCodes = async (userId) => {
  const result = await pool.query(
    `SELECT
       id,
       title,
       destination,
       qr_type,
       short_code,
       is_active,
       expires_at,
       created_at,
       updated_at
     FROM qr_codes
     WHERE user_id = $1
     ORDER BY created_at DESC`,
    [userId],
  )

  return result.rows
}


export const getQrCodeById = async (qrId, userId) => {
  const result = await pool.query(
    `SELECT
       id,
       user_id,
       title,
       destination,
       qr_type,
       short_code,
       is_active,
       expires_at,
       created_at,
       updated_at
     FROM qr_codes
     WHERE id = $1 AND user_id = $2`,
    [qrId, userId],
  )

  if (result.rows.length === 0) {
    const error = new Error('QR code not found')
    error.statusCode = 404
    throw error
  }

  return result.rows[0]
}


export const updateQrCode = async (qrId, userId, updates) => {
  // Find the QR code belonging to this user.
  const existingResult = await pool.query(
    `SELECT id, title, destination, qr_type, is_active, expires_at
     FROM qr_codes
     WHERE id = $1 AND user_id = $2`,
    [qrId, userId],
  )

  if (existingResult.rows.length === 0) {
    const error = new Error('QR code not found')
    error.statusCode = 404
    throw error
  }

  const existingQr = existingResult.rows[0]

  const title = updates.title ?? existingQr.title
  const destination = updates.destination ?? existingQr.destination

  // Dynamic QR codes must always point to valid HTTP/HTTPS URLs.
  if (existingQr.qr_type === 'dynamic') {
    try {
      const url = new URL(destination)

      if (!['http:', 'https:'].includes(url.protocol)) {
        throw new Error('Invalid protocol')
      }
    } catch {
      const error = new Error(
        'Dynamic QR codes require a valid HTTP or HTTPS URL',
      )
      error.statusCode = 400
      throw error
    }
  }

  const isActive = updates.isActive ?? existingQr.is_active

  const expiresAt =
    updates.expiresAt === undefined
      ? existingQr.expires_at
      : updates.expiresAt

  const result = await pool.query(
    `UPDATE qr_codes
     SET
       title = $1,
       destination = $2,
       is_active = $3,
       expires_at = $4,
       updated_at = NOW()
     WHERE id = $5 AND user_id = $6
     RETURNING
       id,
       user_id,
       title,
       destination,
       qr_type,
       short_code,
       is_active,
       expires_at,
       created_at,
       updated_at`,
    [title, destination, isActive, expiresAt, qrId, userId],
  )

  return result.rows[0]
}

export const deleteQrCode = async (qrId, userId) => {
  const result = await pool.query(
    `DELETE FROM qr_codes
     WHERE id = $1 AND user_id = $2
     RETURNING id`,
    [qrId, userId],
  )

  if (result.rowCount === 0) {
    const error = new Error('QR code not found')
    error.statusCode = 404
    throw error
  }

  return result.rows[0]
}

export const getDynamicQrByShortCode = async (shortCode) => {
  const result = await pool.query(
    `SELECT id, destination, is_active, expires_at
     FROM qr_codes
     WHERE short_code = $1
       AND qr_type = 'dynamic'`,
    [shortCode],
  )

  if (result.rows.length === 0) {
    const error = new Error('QR code not found')
    error.statusCode = 404
    throw error
  }

  const qrCode = result.rows[0]

  if (!qrCode.is_active) {
    const error = new Error('This QR code is inactive')
    error.statusCode = 410
    throw error
  }

  if (qrCode.expires_at && new Date(qrCode.expires_at) <= new Date()) {
    const error = new Error('This QR code has expired')
    error.statusCode = 410
    throw error
  }

  return qrCode
}

export const recordQrScan = async (
  qrCodeId,
  { deviceType, browser, operatingSystem, referrer },
) => {
  await pool.query(
    `INSERT INTO qr_scans
      (qr_code_id, device_type, browser, operating_system, referrer)
     VALUES ($1, $2, $3, $4, $5)`,
    [qrCodeId, deviceType, browser, operatingSystem, referrer],
  )
}


