
import { describe, it, expect, vi, afterEach } from 'vitest'
import express from 'express'
import request from 'supertest'

import errorHandler from '../middleware/error.middleware.js'
import { logger, requestLogger } from '../config/logger.js'

const createTestApp = () => {
  const app = express()

  app.use(requestLogger)
  app.use(express.json({ limit: '20b' }))

  app.get('/error', (req, res, next) => {
    const error = new Error('Something went wrong')
    error.statusCode = 409
    next(error)
  })

  app.get('/server-error', (req, res, next) => {
    next(new Error('Database password leaked'))
  })

  app.post('/body', (req, res) => {
    res.json({ success: true, data: req.body })
  })

  app.use(errorHandler)

  return app
}

describe('Centralized Error Middleware', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should return a consistent 409 conflict response', async () => {
    const warnSpy = vi.spyOn(logger, 'warn')

    const response = await request(createTestApp()).get('/error')

    expect(response.status).toBe(409)
    expect(response.body).toEqual({
      success: false,
      code: 'CONFLICT',
      message: 'Something went wrong',
    })

    expect(warnSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        requestId: response.headers['x-request-id'],
        method: 'GET',
        statusCode: 409,
      }),
      'API request rejected',
    )
  })

  it('should log unexpected server errors with request ID', async () => {
    const errorSpy = vi.spyOn(logger, 'error')

    const response = await request(createTestApp()).get('/server-error')

    expect(response.status).toBe(500)
    expect(response.body).toEqual({
      success: false,
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Internal server error',
    })

    expect(response.body.message).not.toContain('Database password')

    expect(errorSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        requestId: response.headers['x-request-id'],
        method: 'GET',
        statusCode: 500,
      }),
      'API request failed',
    )
  })

  it('should return 400 for malformed JSON', async () => {
    const response = await request(createTestApp())
      .post('/body')
      .set('Content-Type', 'application/json')
      .send('{invalid json}')

    expect(response.status).toBe(400)
    expect(response.body.code).toBe('BAD_REQUEST')
    expect(response.body.message).toBe('Invalid JSON request body')
  })

  it('should return 413 for oversized JSON requests', async () => {
    const response = await request(createTestApp())
      .post('/body')
      .send({ value: 'This request body is intentionally too large' })

    expect(response.status).toBe(413)
    expect(response.body.code).toBe('PAYLOAD_TOO_LARGE')
    expect(response.body.message).toBe('Request body is too large')
  })

  it('should not parse plain-text request bodies as JSON', async () => {
    const response = await request(createTestApp())
      .post('/body')
      .set('Content-Type', 'text/plain')
      .send('This is plain text')

    expect(response.status).toBe(200)
    expect(response.body.data).toBeUndefined()
  })
})
