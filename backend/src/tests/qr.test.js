
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

const userOne = {
  name: 'QR Test User One',
  email: `qr-one-${randomUUID()}@example.com`,
  password: 'TestPassword@123',
}

const userTwo = {
  name: 'QR Test User Two',
  email: `qr-two-${randomUUID()}@example.com`,
  password: 'TestPassword@123',
}

let tokenOne
let tokenTwo
let staticQrId
let dynamicQrId

const staticQr = {
  title: 'Static Test QR',
  destination: 'https://example.com/static',
  qrType: 'static',
}

const dynamicQr = {
  title: 'Dynamic Test QR',
  destination: 'https://example.com/original',
  qrType: 'dynamic',
}

const createUser = async (user) => {
  const registerResponse = await request(app)
    .post('/api/auth/register')
    .send(user)

  expect(registerResponse.status).toBe(201)

  const loginResponse = await request(app)
    .post('/api/auth/login')
    .send({
      email: user.email,
      password: user.password,
    })

  expect(loginResponse.status).toBe(200)

  return loginResponse.body.data?.token ?? loginResponse.body.token
}

describe('SmartQR QR Management API', () => {
  beforeAll(async () => {
    tokenOne = await createUser(userOne)
    tokenTwo = await createUser(userTwo)

    expect(tokenOne).toBeTruthy()
    expect(tokenTwo).toBeTruthy()

    const staticResponse = await request(app)
      .post('/api/qr')
      .set('Authorization', `Bearer ${tokenOne}`)
      .send(staticQr)

    expect(staticResponse.status).toBe(201)
    staticQrId = staticResponse.body.data.qrCode.id

    const dynamicResponse = await request(app)
      .post('/api/qr')
      .set('Authorization', `Bearer ${tokenOne}`)
      .send(dynamicQr)

    expect(dynamicResponse.status).toBe(201)
    dynamicQrId = dynamicResponse.body.data.qrCode.id
  })

  it('should reject unauthenticated QR requests', async () => {
    const response = await request(app)
      .get('/api/qr')

    expect(response.status).toBe(401)
  })

  it('should reject an invalid dynamic QR destination', async () => {
    const response = await request(app)
      .post('/api/qr')
      .set('Authorization', `Bearer ${tokenOne}`)
      .send({
        title: 'Invalid Dynamic QR',
        destination: 'not-a-valid-url',
        qrType: 'dynamic',
      })

    expect(response.status).toBe(400)
  })

  it('should list only the logged-in user QR codes', async () => {
    const response = await request(app)
      .get('/api/qr')
      .set('Authorization', `Bearer ${tokenOne}`)

    expect(response.status).toBe(200)
    expect(response.body.success).toBe(true)
    expect(response.body.data.qrCodes).toBeInstanceOf(Array)

    const ids = response.body.data.qrCodes.map((qr) => qr.id)

    expect(ids).toContain(staticQrId)
    expect(ids).toContain(dynamicQrId)
  })

  it('should retrieve a QR code by ID', async () => {
    const response = await request(app)
      .get(`/api/qr/${staticQrId}`)
      .set('Authorization', `Bearer ${tokenOne}`)

    expect(response.status).toBe(200)
    expect(response.body.data.qrCode.id).toBe(staticQrId)
  })

  it('should update a static QR code', async () => {
    const response = await request(app)
      .patch(`/api/qr/${staticQrId}`)
      .set('Authorization', `Bearer ${tokenOne}`)
      .send({
        title: 'Updated Static QR',
        destination: 'https://example.com/updated',
        isActive: false,
      })

    expect(response.status).toBe(200)
    expect(response.body.data.qrCode.title).toBe('Updated Static QR')
    expect(response.body.data.qrCode.destination)
      .toBe('https://example.com/updated')
    expect(response.body.data.qrCode.is_active).toBe(false)
  })

  it('should update a dynamic QR destination', async () => {
    const response = await request(app)
      .patch(`/api/qr/${dynamicQrId}`)
      .set('Authorization', `Bearer ${tokenOne}`)
      .send({
        destination: 'https://example.com/updated-destination',
      })

    expect(response.status).toBe(200)
    expect(response.body.data.qrCode.destination)
      .toBe('https://example.com/updated-destination')
  })

  it('should prevent another user from accessing the QR code', async () => {
    const response = await request(app)
      .get(`/api/qr/${staticQrId}`)
      .set('Authorization', `Bearer ${tokenTwo}`)

    expect(response.status).toBe(404)
  })

  it('should prevent another user from updating the QR code', async () => {
    const response = await request(app)
      .patch(`/api/qr/${staticQrId}`)
      .set('Authorization', `Bearer ${tokenTwo}`)
      .send({
        title: 'Unauthorized Update',
      })

    expect(response.status).toBe(404)
  })

  it('should prevent another user from deleting the QR code', async () => {
    const response = await request(app)
      .delete(`/api/qr/${staticQrId}`)
      .set('Authorization', `Bearer ${tokenTwo}`)

    expect(response.status).toBe(404)
  })

  it('should delete a QR code belonging to its owner', async () => {
    const response = await request(app)
      .delete(`/api/qr/${staticQrId}`)
      .set('Authorization', `Bearer ${tokenOne}`)

    expect(response.status).toBe(200)
    expect(response.body.success).toBe(true)

    const getResponse = await request(app)
      .get(`/api/qr/${staticQrId}`)
      .set('Authorization', `Bearer ${tokenOne}`)

    expect(getResponse.status).toBe(404)
  })
})

afterAll(async () => {
  await pool.query(
    'DELETE FROM users WHERE email = ANY($1::text[])',
    [[userOne.email, userTwo.email]],
  )

  await pool.end()
})
