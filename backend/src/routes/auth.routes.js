
import { Router } from 'express'

import {
  register,
  login,
  getMe,
} from '../controllers/auth.controller.js'

import validate from '../middleware/validate.middleware.js'
import authenticate from '../middleware/auth.middleware.js'
import authRateLimiter from '../middleware/auth-rate-limit.middleware.js'

import {
  registerSchema,
  loginSchema,
} from '../validators/auth.validator.js'

const router = Router()

// Apply rate limiting before validation.
router.post('/register', authRateLimiter, validate(registerSchema), register)
router.post('/login', authRateLimiter, validate(loginSchema), login)

// Protected route
router.get('/me', authenticate, getMe)

export default router
