
import { describe, it, expect } from 'vitest'
import express from 'express'
import request from 'supertest'

import hppProtection from '../middleware/hpp.middleware.js'

const createTestApp = () => {
  const app = express()

  app.set('query parser', 'simple')

  app.use(hppProtection)

  app.get('/api/resource', (req, res) => {
    res.json({
      success: true,
      query: req.query,
    })
  })

  return app
}

describe('HTTP Parameter Pollution Protection', () => {
  it('should allow normal query parameters', async () => {
    const response = await request(createTestApp())
      .get('/api/resource?page=1&limit=10')

    expect(response.status).toBe(200)
    expect(response.body.query.page).toBe('1')
    expect(response.body.query.limit).toBe('10')
  })

  it('should reject duplicate query parameters', async () => {
    const response = await request(createTestApp())
      .get('/api/resource?page=1&page=999')

    expect(response.status).toBe(400)
    expect(response.body.code).toBe('DUPLICATE_QUERY_PARAMETER')
  })

  it('should allow different query parameters with the same value', async () => {
    const response = await request(createTestApp())
      .get('/api/resource?page=1&limit=1')

    expect(response.status).toBe(200)
  })

  it('should allow requests without query parameters', async () => {
    const response = await request(createTestApp())
      .get('/api/resource')

    expect(response.status).toBe(200)
  })
})
