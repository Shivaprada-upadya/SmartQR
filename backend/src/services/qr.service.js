
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



export const getUserQrCodes = async (
  userId,
  {
    page,
    limit,
    search,
    qrType,
    isActive,
    sortBy,
    sortOrder,
  },
) => {
  const offset = (page - 1) * limit

  // Map API sort fields to trusted database column names.
  const sortColumns = {
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    title: 'title',
  }

  const sortColumn = sortColumns[sortBy] ?? 'created_at'
  const sortDirection = sortOrder === 'asc' ? 'ASC' : 'DESC'

  const queryParams = [
    userId,
    search ?? null,
    qrType ?? null,
    isActive ?? null,
  ]

  const filterConditions = `
    WHERE user_id = $1
      AND ($2::text IS NULL OR title ILIKE '%' || $2 || '%')
      AND ($3::text IS NULL OR qr_type = $3)
      AND ($4::boolean IS NULL OR is_active = $4)
  `

  const [qrResult, countResult] = await Promise.all([
    pool.query(
      `SELECT
         id, title, destination, qr_type, short_code, is_active,
         expires_at, created_at, updated_at
       FROM qr_codes
       ${filterConditions}
       ORDER BY ${sortColumn} ${sortDirection}, id DESC
       LIMIT $5 OFFSET $6`,
      [...queryParams, limit, offset],
    ),

    pool.query(
      `SELECT COUNT(*)::int AS total_records
       FROM qr_codes
       ${filterConditions}`,
      queryParams,
    ),
  ])

  return {
    qrCodes: qrResult.rows,
    totalRecords: countResult.rows[0].total_records,
  }
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

export const bulkManageQrCodes = async (userId, ids, action) => {
  const client = await pool.connect()
  let transactionStarted = false

  try {
    await client.query('BEGIN')
    transactionStarted = true

    const ownedQrCodes = await client.query(
      `SELECT id
       FROM qr_codes
       WHERE user_id = $1 AND id = ANY($2::uuid[])
      ORDER BY id
       FOR UPDATE`,
      [userId, ids],
    )

    if (ownedQrCodes.rows.length !== ids.length) {
      const error = new Error('One or more QR codes were not found')
      error.statusCode = 404
      throw error
    }

    const result =
      action === 'delete'
        ? await client.query(
            `DELETE FROM qr_codes
             WHERE user_id = $1 AND id = ANY($2::uuid[])
             RETURNING id`,
            [userId, ids],
          )
        : await client.query(
            `UPDATE qr_codes
             SET is_active = $2, updated_at = NOW()
             WHERE user_id = $1 AND id = ANY($3::uuid[])
             RETURNING id`,
            [userId, action === 'activate', ids],
          )

    await client.query('COMMIT')
    transactionStarted = false

    return { affectedCount: result.rowCount }
  } catch (error) {
    if (transactionStarted) {
      await client.query('ROLLBACK')
    }

    throw error
  } finally {
    client.release()
  }
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


export const getQrAnalytics = async (qrId, userId, range = '7d') => {
  // Number of days to include in each date range.
  const rangeDays = {
    '7d': 7,
    '30d': 30,
    '90d': 90,
  }

  // Verify that this QR code belongs to the logged-in user.
  const qrResult = await pool.query(
    `SELECT id, title, qr_type, created_at
     FROM qr_codes
     WHERE id = $1 AND user_id = $2`,
    [qrId, userId],
  )

  if (qrResult.rows.length === 0) {
    const error = new Error('QR code not found')
    error.statusCode = 404
    throw error
  }

  // For all-time analytics, start from the QR code creation date.
  const rangeStart =
    range === 'all' ? qrResult.rows[0].created_at : null

  const days = rangeDays[range] ?? null

  // Shared date-range condition for analytics queries.
  const rangeParams = [qrId, rangeStart, days]

  // Scan summary for the selected date range.
  const summaryResult = await pool.query(
    `SELECT
       COUNT(*) FILTER (
         WHERE scanned_at >= COALESCE(
           $2::timestamptz,
           CURRENT_DATE - (($3::int - 1) * INTERVAL '1 day')
         )
         AND scanned_at < CURRENT_DATE + INTERVAL '1 day'
       )::int AS total_scans,

       COUNT(*) FILTER (
         WHERE scanned_at >= CURRENT_DATE
         AND scanned_at < CURRENT_DATE + INTERVAL '1 day'
       )::int AS today_scans,

       COUNT(*)::int AS all_time_scans

     FROM qr_scans
     WHERE qr_code_id = $1`,
    rangeParams,
  )

  // Daily scans for the selected range, including zero-scan days.
  const dailyResult = await pool.query(
    `SELECT
       days.day::date AS date,
       COUNT(scans.id)::int AS scans
     FROM generate_series(
       COALESCE(
         $2::date,
         CURRENT_DATE - ($3::int - 1)
       ),
       CURRENT_DATE,
       INTERVAL '1 day'
     ) AS days(day)
     LEFT JOIN qr_scans scans
       ON scans.qr_code_id = $1
       AND scans.scanned_at >= days.day
       AND scans.scanned_at < days.day + INTERVAL '1 day'
     GROUP BY days.day
     ORDER BY days.day`,
    rangeParams,
  )

  // Device statistics for the selected range.
  const deviceResult = await pool.query(
    `SELECT
       device_type,
       COUNT(*)::int AS scans
     FROM qr_scans
     WHERE qr_code_id = $1
       AND scanned_at >= COALESCE(
         $2::timestamptz,
         CURRENT_DATE - (($3::int - 1) * INTERVAL '1 day')
       )
       AND scanned_at < CURRENT_DATE + INTERVAL '1 day'
     GROUP BY device_type
     ORDER BY scans DESC`,
    rangeParams,
  )

  // Browser statistics for the selected range.
  const browserResult = await pool.query(
    `SELECT
       COALESCE(browser, 'Unknown') AS browser,
       COUNT(*)::int AS scans
     FROM qr_scans
     WHERE qr_code_id = $1
       AND scanned_at >= COALESCE(
         $2::timestamptz,
         CURRENT_DATE - (($3::int - 1) * INTERVAL '1 day')
       )
       AND scanned_at < CURRENT_DATE + INTERVAL '1 day'
     GROUP BY browser
     ORDER BY scans DESC`,
    rangeParams,
  )

  // Operating system statistics for the selected range.
  const osResult = await pool.query(
    `SELECT
       COALESCE(operating_system, 'Unknown') AS operating_system,
       COUNT(*)::int AS scans
     FROM qr_scans
     WHERE qr_code_id = $1
       AND scanned_at >= COALESCE(
         $2::timestamptz,
         CURRENT_DATE - (($3::int - 1) * INTERVAL '1 day')
       )
       AND scanned_at < CURRENT_DATE + INTERVAL '1 day'
     GROUP BY operating_system
     ORDER BY scans DESC`,
    rangeParams,
  )

  // Latest ten scans within the selected range.
  const recentResult = await pool.query(
    `SELECT
       id,
       scanned_at,
       device_type,
       browser,
       operating_system,
       referrer
     FROM qr_scans
     WHERE qr_code_id = $1
       AND scanned_at >= COALESCE(
         $2::timestamptz,
         CURRENT_DATE - (($3::int - 1) * INTERVAL '1 day')
       )
       AND scanned_at < CURRENT_DATE + INTERVAL '1 day'
     ORDER BY scanned_at DESC
     LIMIT 10`,
    rangeParams,
  )

  return {
    qrCode: qrResult.rows[0],
    summary: summaryResult.rows[0],
    dailyScans: dailyResult.rows,
    deviceBreakdown: deviceResult.rows,
    browserBreakdown: browserResult.rows,
    operatingSystemBreakdown: osResult.rows,
    recentScans: recentResult.rows,
  }
}
