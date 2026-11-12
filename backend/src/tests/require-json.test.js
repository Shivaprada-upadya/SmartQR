
import { describe, it, expect } from 'vitest'
import express from 'express'
import request from 'supertest'

import requireJsonContentType from '../middleware/require-json.middleware.js'
import errorHandler from '../middleware/error.middleware.js'

const createTestApp = () => {
  const app = express()

  app.use(express.json())
  app.use(requireJsonContentType)

  app.post('/api/resource', (req, res) => {
    res.status(201).json({
      success: true,
      data: req.body,
    })
  })

  app.get('/api/resource', (req, res) => {
    res.json({ success: true })
  })

  app.use(errorHandler)

  return app
}

describe('JSON Content-Type Middleware', () => {
  it('should allow application/json requests', async () => {
    const response = await request(createTestApp())
      .post('/api/resource')
      .send({ title: 'SmartQR' })

    expect(response.status).toBe(201)
    expect(response.body.data.title).toBe('SmartQR')
  })

  it('should reject text/plain requests with 415', async () => {
    const response = await request(createTestApp())
      .post('/api/resource')
      .set('Content-Type', 'text/plain')
      .send('plain text')

    expect(response.status).toBe(415)
    expect(response.body.code).toBe('UNSUPPORTED_MEDIA_TYPE')
  })

  it('should reject requests without a content type', async () => {
    const response = await request(createTestApp())
      .post('/api/resource')

    expect(response.status).toBe(415)
    expect(response.body.code).toBe('UNSUPPORTED_MEDIA_TYPE')
  })

  it('should allow GET requests without a JSON content type', async () => {
    const response = await request(createTestApp())
      .get('/api/resource')

    expect(response.status).toBe(200)
    expect(response.body.success).toBe(true)
  })
})
