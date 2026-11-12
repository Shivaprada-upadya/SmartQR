import pino from 'pino'
import pinoHttp from 'pino-http'
import { randomUUID } from 'node:crypto'

export const logger = pino({
  level: process.env.LOG_LEVEL || (
    process.env.NODE_ENV === 'production' ? 'info' : 'debug'
  ),

  timestamp: pino.stdTimeFunctions.isoTime,

  redact: {
    paths: [
      'req.headers.authorization',
      'req.headers.cookie',
    ],
    censor: '[REDACTED]',
  },
})

export const requestLogger = pinoHttp({
  logger,

  genReqId: (req, res) => {
    const requestId = randomUUID()

    res.setHeader('X-Request-ID', requestId)

    return requestId
  },

  customLogLevel: (req, res, err) => {
    if (err || res.statusCode >= 500) return 'error'
    if (res.statusCode >= 400) return 'warn'

    return 'info'
  },

  customSuccessMessage: (req, res) => {
    return `${req.method} ${req.url} completed`
  },

  customErrorMessage: (req, res, err) => {
    return `${req.method} ${req.url} failed: ${err.message}`
  },
})
