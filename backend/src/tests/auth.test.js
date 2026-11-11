
import { describe, it, expect, afterAll } from 'vitest'
import request from 'supertest'
import { randomUUID } from 'node:crypto'

import app from '../app.js'
import pool from '../config/database.js'

const testUser = {
  name: 'SmartQR Test User',
  email: `test-${randomUUID()}@example.com`,
  password: 'TestPassword@123',
}

let authToken

describe('SmartQR Authentication API', () => {
  it('should register a new user', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send(testUser)

    expect(response.status).toBe(201)
    expect(response.body.success).toBe(true)
  })

  it('should reject duplicate email registration', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send(testUser)

    expect(response.status).toBe(409)
  })

  it('should login with valid credentials', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: testUser.email,
        password: testUser.password,
      })

    expect(response.status).toBe(200)
    expect(response.body.success).toBe(true)

    authToken =
      response.body.data?.token ?? response.body.token

    expect(authToken).toBeTruthy()
  })

  it('should reject invalid login credentials', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: testUser.email,
        password: 'WrongPassword@123',
      })

    expect(response.status).toBe(401)
  })

  it('should reject profile access without a token', async () => {
    const response = await request(app)
      .get('/api/auth/me')

    expect(response.status).toBe(401)
  })

  it('should return the user profile with a valid token', async () => {
    const response = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${authToken}`)

    expect(response.status).toBe(200)
    expect(response.body.success).toBe(true)
  })
})

afterAll(async () => {
  await pool.query(
    'DELETE FROM users WHERE email = $1',
    [testUser.email],
  )

  await pool.end()
})
