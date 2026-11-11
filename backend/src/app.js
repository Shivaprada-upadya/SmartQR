import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import { rateLimit } from 'express-rate-limit'

import authRoutes from './routes/auth.routes.js'
import healthRoutes from './routes/health.routes.js'
import qrRoutes from './routes/qr.routes.js'
import redirectRoutes from './routes/redirect.routes.js'
import notFoundHandler from './middleware/not-found.middleware.js'
import errorHandler from './middleware/error.middleware.js'

const app = express()

// Security headers
app.use(helmet())

// Cross-origin configuration
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
  }),
)

// Request logging
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'))
}

// Parse JSON requests
app.use(express.json({ limit: '10kb' }))

// Basic API rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
})

app.use('/api', apiLimiter)

// API routes
app.use('/api/health', healthRoutes)
app.use('/api/auth', authRoutes)
app.use('/api/qr', qrRoutes)
app.use('/r', redirectRoutes)
// Handle unknown routes and errors
app.use(notFoundHandler)
app.use(errorHandler)

export default app