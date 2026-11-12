import { Router } from 'express'
import pool from '../config/database.js'
import { logger } from '../config/logger.js'

const router = Router()

// Backend health check
router.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'SmartQR API is running',
    timestamp: new Date().toISOString(),
  })
})

// PostgreSQL health check
router.get('/db', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        current_database() AS database,
        current_user AS user,
        NOW() AS server_time
    `)

    res.status(200).json({
      success: true,
      message: 'PostgreSQL connected successfully',
      data: result.rows[0],
    })
  } catch (error) {
    logger.error({ err: error }, 'Database health check failed')

    res.status(503).json({
      success: false,
      message: 'Database connection unavailable',
    })
  }
})

export default router