
import { logger } from '../config/logger.js'

const errorHandler = (err, req, res, next) => {
  // Determine the HTTP status.
  let statusCode = err.statusCode || err.status || 500

  // Handle malformed JSON and oversized request bodies.
  if (err.type === 'entity.parse.failed') {
    statusCode = 400
  }

  if (err.type === 'entity.too.large') {
    statusCode = 413
  }

  // Only allow valid HTTP error status codes.
  if (
    !Number.isInteger(statusCode) ||
    statusCode < 400 ||
    statusCode > 599
  ) {
    statusCode = 500
  }

  // Assign stable error codes.
  let code = 'INTERNAL_SERVER_ERROR'

  if (statusCode === 400) {
    code = 'BAD_REQUEST'
  } else if (statusCode === 401) {
    code = 'UNAUTHORIZED'
  } else if (statusCode === 403) {
    code = 'FORBIDDEN'
  } else if (statusCode === 404) {
    code = 'NOT_FOUND'
  } else if (statusCode === 409) {
    code = 'CONFLICT'
  } else if (statusCode === 413) {
    code = 'PAYLOAD_TOO_LARGE'
  } else if (statusCode === 429) {
    code = 'TOO_MANY_REQUESTS'
  }

  // Log the error with request context.
  const logContext = {
    err,
    requestId: req.id || 'unavailable',
    method: req.method,
    path: req.originalUrl,
    statusCode,
  }

  if (statusCode >= 500) {
    logger.error(logContext, 'API request failed')
  } else {
    logger.warn(logContext, 'API request rejected')
  }

  // Let Express handle errors if the response has already started.
  if (res.headersSent) {
    return next(err)
  }

  // Never expose internal server error details.
  const message =
    statusCode === 500
      ? 'Internal server error'
      : err.type === 'entity.parse.failed'
        ? 'Invalid JSON request body'
        : err.type === 'entity.too.large'
          ? 'Request body is too large'
          : err.message || 'Request failed'

  return res.status(statusCode).json({
    success: false,
    code,
    message,
  })
}

export default errorHandler
