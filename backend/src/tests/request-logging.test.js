import { describe, it, expect } from 'vitest'
import request from 'supertest'

import app from '../app.js'

describe('Request logging and request IDs', () => {
  it('should include a valid request ID in successful responses', async () => {
    const response = await request(app)
      .get('/api/health')

    expect(response.status).toBe(200)
    expect(response.headers['x-request-id']).toBeDefined()

    expect(response.headers['x-request-id']).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    )
  })

  it('should generate a unique request ID for every request', async () => {
    const firstResponse = await request(app)
      .get('/api/health')

    const secondResponse = await request(app)
      .get('/api/health')

    const firstRequestId = firstResponse.headers['x-request-id']
    const secondRequestId = secondResponse.headers['x-request-id']

    expect(firstRequestId).toBeDefined()
    expect(secondRequestId).toBeDefined()
    expect(firstRequestId).not.toBe(secondRequestId)
  })

  it('should include a request ID in not-found responses', async () => {
    const response = await request(app)
      .get('/api/non-existent-route')

    expect(response.status).toBe(404)
    expect(response.headers['x-request-id']).toBeDefined()
  })
})
