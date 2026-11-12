
import { describe, it, expect } from 'vitest'
import express from 'express'
import request from 'supertest'

import { createAuthRateLimiter } from '../middleware/auth-rate-limit.middleware.js'

const createTestApp = () => {
  const app = express()

  app.use(express.json())

  app.post(
    '/login',
    createAuthRateLimiter({
      limit: 2,
    }),
    (req, res) => {
      res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      })
    },
  )

  return app
}

describe('Authentication Rate Limiting', () => {
  it('should allow requests within the configured limit', async () => {
    const app = createTestApp()

    const firstResponse = await request(app).post('/login')
    const secondResponse = await request(app).post('/login')

    expect(firstResponse.status).toBe(401)
    expect(secondResponse.status).toBe(401)
  })

  it('should return 429 after exceeding the limit', async () => {
    const app = createTestApp()

    await request(app).post('/login')
    await request(app).post('/login')

    const response = await request(app).post('/login')

    expect(response.status).toBe(429)
    expect(response.body.success).toBe(false)
    expect(response.body.code).toBe('TOO_MANY_REQUESTS')
  })

  it('should include standard rate-limit headers', async () => {
    const app = createTestApp()

    const response = await request(app).post('/login')

    expect(response.headers['ratelimit-policy']).toBeDefined()
    expect(response.headers.ratelimit).toBeDefined()
    expect(response.headers['x-ratelimit-limit']).toBeUndefined()
  })
})
