import 'dotenv/config'
import app from './app.js'
import { logger } from './config/logger.js'

const PORT = process.env.PORT || 5000

const server = app.listen(PORT, () => {
  logger.info(`SmartQR API running on http://localhost:${PORT}`)
  logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`)
})

// Graceful shutdown
const shutdown = (signal) => {
  logger.info(`${signal} received. Shutting down server...`)

  server.close(() => {
    logger.info('HTTP server closed')
    process.exit(0)
  })
}

process.on('SIGTERM', () => shutdown('SIGTERM'))
process.on('SIGINT', () => shutdown('SIGINT'))