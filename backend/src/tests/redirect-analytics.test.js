
import {
  describe,
  it,
  expect,
  beforeAll,
  afterAll,
} from 'vitest'

import request from 'supertest'
import { randomUUID } from 'node:crypto'

import app from '../app.js'
import pool from '../config/database.js'

const testUser = {
  name: 'Redirect Analytics Test User',
  email: `redirect-${randomUUID()}@example.com`,
  password: 'TestPassword@123',
}

let token
let activeQr
let inactiveQr
let expiredQr

const createDynamicQr = async (title, destination, expiresAt) => {
  const response = await request(app)
    .post('/api/qr')
    .set('Authorization', `Bearer ${token}`)
    .send({
      title,
      destination,
      qrType: 'dynamic',
      ...(expiresAt ? { expiresAt } : {}),
    })

  expect(response.status).toBe(201)

  return response.body.data.qrCode
}

describe('SmartQR Redirect and Analytics API', () => {
  beforeAll(async () => {
    const registerResponse = await request(app)
      .post('/api/auth/register')
      .send(testUser)

    expect(registerResponse.status).toBe(201)

    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: testUser.email,
        password: testUser.password,
      })

    expect(loginResponse.status).toBe(200)

    token =
      loginResponse.body.data?.token ??
      loginResponse.body.token

    expect(token).toBeTruthy()

    activeQr = await createDynamicQr(
      'Active Redirect QR',
      'https://example.com/active',
    )

    inactiveQr = await createDynamicQr(
      'Inactive Redirect QR',
      'https://example.com/inactive',
    )

    expiredQr = await createDynamicQr(
      'Expired Redirect QR',
      'https://example.com/expired',
      new Date(Date.now() - 60_000).toISOString(),
    )

    const deactivateResponse = await request(app)
      .patch(`/api/qr/${inactiveQr.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ isActive: false })

    expect(deactivateResponse.status).toBe(200)
  })

  it('should redirect a valid dynamic QR code', async () => {
    const response = await request(app)
      .get(`/r/${activeQr.short_code}`)
      .set(
        'User-Agent',
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0 Safari/537.36',
      )
      .set('Referer', 'https://google.com')

    expect(response.status).toBe(302)
    expect(response.headers.location).toBe(
      'https://example.com/active',
    )
  })

  it('should return 404 for an invalid short code', async () => {
    const response = await request(app)
      .get('/r/nonexistent-code-123')

    expect(response.status).toBe(404)
  })

  it('should reject an inactive QR code', async () => {
    const response = await request(app)
      .get(`/r/${inactiveQr.short_code}`)

    expect(response.status).toBe(410)
  })

  it('should reject an expired QR code', async () => {
    const response = await request(app)
      .get(`/r/${expiredQr.short_code}`)

    expect(response.status).toBe(410)
  })

  it('should record scan metadata in the database', async () => {
    const result = await pool.query(
      `SELECT device_type, browser, operating_system, referrer
       FROM qr_scans
       WHERE qr_code_id = $1
       ORDER BY scanned_at DESC
       LIMIT 1`,
      [activeQr.id],
    )

    expect(result.rows).toHaveLength(1)

    expect(result.rows[0]).toMatchObject({
      device_type: 'desktop',
      browser: 'Chrome',
      operating_system: 'Windows',
      referrer: 'https://google.com',
    })
  })

  it('should return correct analytics for the QR code', async () => {
    const response = await request(app)
      .get(`/api/qr/${activeQr.id}/analytics`)
      .set('Authorization', `Bearer ${token}`)

    expect(response.status).toBe(200)
    expect(response.body.success).toBe(true)

    const analytics = response.body.data

    expect(analytics.summary.total_scans).toBe(1)
    expect(analytics.summary.today_scans).toBe(1)

    expect(analytics.dailyScans).toHaveLength(7)

    expect(analytics.deviceBreakdown).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          device_type: 'desktop',
          scans: 1,
        }),
      ]),
    )

    expect(analytics.browserBreakdown).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          browser: 'Chrome',
          scans: 1,
        }),
      ]),
    )
  })

  it('should prevent another user from accessing QR analytics', async () => {
    const anotherUser = {
      name: 'Another Test User',
      email: `another-${randomUUID()}@example.com`,
      password: 'TestPassword@123',
    }

    const registerResponse = await request(app)
      .post('/api/auth/register')
      .send(anotherUser)

    expect(registerResponse.status).toBe(201)

    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: anotherUser.email,
        password: anotherUser.password,
      })

    expect(loginResponse.status).toBe(200)

    const anotherToken =
      loginResponse.body.data?.token ??
      loginResponse.body.token

    const response = await request(app)
      .get(`/api/qr/${activeQr.id}/analytics`)
      .set('Authorization', `Bearer ${anotherToken}`)

    expect(response.status).toBe(404)

    await pool.query(
      'DELETE FROM users WHERE email = $1',
      [anotherUser.email],
    )
  })
})

afterAll(async () => {
  await pool.query(
    'DELETE FROM users WHERE email = $1',
    [testUser.email],
  )

  await pool.end()
})
