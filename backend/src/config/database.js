
import pg from 'pg'
import { logger } from './logger.js'

const { Pool } = pg

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
})

pool.on('connect', () => {
  logger.info('PostgreSQL client connected')
})

pool.on('error', (error) => {
  logger.error({ err: error }, 'Unexpected PostgreSQL pool error')
})

export default pool
