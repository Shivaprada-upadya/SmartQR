
import { rateLimit } from 'express-rate-limit'

export const createAuthRateLimiter = (options = {}) => {
  return rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 10,
    standardHeaders: 'draft-7',
    legacyHeaders: false,

    message: {
      success: false,
      code: 'TOO_MANY_REQUESTS',
      message: 'Too many authentication attempts. Please try again later.',
    },

    ...options,
  })
}

const authRateLimiter = createAuthRateLimiter()

export default authRateLimiter
