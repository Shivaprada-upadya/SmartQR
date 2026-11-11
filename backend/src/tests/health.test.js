import { describe, it, expect, afterAll } from 'vitest'
import request from 'supertest'

import app from '../app.js'
import pool from '../config/database.js'

describe('SmartQR Health API', () => {
  it('should return API health status', async () => {
    const response = await request(app)
      .get('/api/health')

    expect(response.status).toBe(200)
    expect(response.body.success).toBe(true)
    expect(response.body.message).toBeTruthy()
  })

  it('should successfully connect to the test database', async () => {
    const response = await request(app)
      .get('/api/health/db')

    expect(response.status).toBe(200)
    expect(response.body.success).toBe(true)
    expect(response.body.data.database).toBe('smartqr_test')
  })
})

afterAll(async () => {
  await pool.end()
})