
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
let paginationQrIdOne
let paginationQrIdTwo
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

    const qrOne = await request(app)
      .post('/api/qr')
      .set('Authorization', `Bearer ${tokenOne}`)
      .send({
        title: 'Pagination QR One',
        destination: 'https://example.com/page-one',
        qrType: 'static',
      })

    expect(qrOne.status).toBe(201)
    paginationQrIdOne = qrOne.body.data.qrCode.id

    const qrTwo = await request(app)
      .post('/api/qr')
      .set('Authorization', `Bearer ${tokenOne}`)
      .send({
        title: 'Pagination QR Two',
        destination: 'https://example.com/page-two',
        qrType: 'static',
      })

    expect(qrTwo.status).toBe(201)
    paginationQrIdTwo = qrTwo.body.data.qrCode.id
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

  // Pagination tests

  it('should return pagination metadata with default values', async () => {
    const response = await request(app)
      .get('/api/qr')
      .set('Authorization', `Bearer ${tokenOne}`)

    expect(response.status).toBe(200)
    expect(response.body.pagination).toEqual({
      page: 1,
      limit: 10,
      totalRecords: 3,
      totalPages: 1,
      hasNextPage: false,
      hasPreviousPage: false,
    })
  })

  it('should return QR codes one page at a time', async () => {
    const pageOne = await request(app)
      .get('/api/qr?page=1&limit=1')
      .set('Authorization', `Bearer ${tokenOne}`)

    const pageTwo = await request(app)
      .get('/api/qr?page=2&limit=1')
      .set('Authorization', `Bearer ${tokenOne}`)

    expect(pageOne.status).toBe(200)
    expect(pageTwo.status).toBe(200)

    expect(pageOne.body.data.qrCodes).toHaveLength(1)
    expect(pageTwo.body.data.qrCodes).toHaveLength(1)

    expect(pageOne.body.pagination.hasNextPage).toBe(true)
    expect(pageTwo.body.pagination.hasPreviousPage).toBe(true)

    expect(pageOne.body.data.qrCodes[0].id)
      .not.toBe(pageTwo.body.data.qrCodes[0].id)
  })

  it('should return an empty paginated list for a user without QR codes', async () => {
    const response = await request(app)
      .get('/api/qr')
      .set('Authorization', `Bearer ${tokenTwo}`)

    expect(response.status).toBe(200)
    expect(response.body.data.qrCodes).toHaveLength(0)
    expect(response.body.pagination.totalRecords).toBe(0)
    expect(response.body.pagination.totalPages).toBe(0)
  })

  it('should reject invalid pagination parameters', async () => {
    const invalidQueries = [
      '?page=0',
      '?page=abc',
      '?limit=0',
      '?limit=101',
    ]

    for (const query of invalidQueries) {
      const response = await request(app)
        .get(`/api/qr${query}`)
        .set('Authorization', `Bearer ${tokenOne}`)

      expect(response.status).toBe(400)
      expect(response.body.success).toBe(false)
    }
  })

  // Search and filtering tests

  it('should search QR codes by title', async () => {
    const response = await request(app)
      .get('/api/qr?search=Pagination%20QR%20One')
      .set('Authorization', `Bearer ${tokenOne}`)

    expect(response.status).toBe(200)
    expect(response.body.data.qrCodes).toHaveLength(1)
    expect(response.body.data.qrCodes[0].title).toBe('Pagination QR One')
    expect(response.body.pagination.totalRecords).toBe(1)
  })

  it('should filter QR codes by type', async () => {
    const response = await request(app)
      .get('/api/qr?qrType=dynamic')
      .set('Authorization', `Bearer ${tokenOne}`)

    expect(response.status).toBe(200)
    expect(response.body.data.qrCodes.length).toBeGreaterThan(0)
    expect(
      response.body.data.qrCodes.every((qr) => qr.qr_type === 'dynamic'),
    ).toBe(true)
  })

  it('should filter active QR codes', async () => {
    const response = await request(app)
      .get('/api/qr?isActive=true')
      .set('Authorization', `Bearer ${tokenOne}`)

    expect(response.status).toBe(200)
    expect(
      response.body.data.qrCodes.every((qr) => qr.is_active === true),
    ).toBe(true)
  })

  it('should filter inactive QR codes', async () => {
    const response = await request(app)
      .get('/api/qr?isActive=false')
      .set('Authorization', `Bearer ${tokenOne}`)

    expect(response.status).toBe(200)
    expect(
      response.body.data.qrCodes.every((qr) => qr.is_active === false),
    ).toBe(true)
  })

  it('should combine QR type, status, search, and pagination filters', async () => {
    const response = await request(app)
      .get('/api/qr?search=Pagination&qrType=static&isActive=true&page=1&limit=1')
      .set('Authorization', `Bearer ${tokenOne}`)

    expect(response.status).toBe(200)
    expect(response.body.data.qrCodes).toHaveLength(1)
    expect(response.body.data.qrCodes[0].title).toContain('Pagination')
    expect(response.body.data.qrCodes[0].qr_type).toBe('static')
    expect(response.body.data.qrCodes[0].is_active).toBe(true)
    expect(response.body.pagination.totalRecords).toBe(2)
    expect(response.body.pagination.limit).toBe(1)
  })

  it('should reject an invalid QR type filter', async () => {
    const response = await request(app)
      .get('/api/qr?qrType=invalid')
      .set('Authorization', `Bearer ${tokenOne}`)

    expect(response.status).toBe(400)
  })

  it('should reject an invalid active status filter', async () => {
    const response = await request(app)
      .get('/api/qr?isActive=yes')
      .set('Authorization', `Bearer ${tokenOne}`)

    expect(response.status).toBe(400)
  })

  // Sorting tests

  it('should sort QR codes by title in ascending order', async () => {
    const response = await request(app)
      .get('/api/qr?sortBy=title&sortOrder=asc')
      .set('Authorization', `Bearer ${tokenOne}`)

    expect(response.status).toBe(200)

    const titles = response.body.data.qrCodes.map((qr) => qr.title)

    expect(titles).toEqual([...titles].sort((a, b) => a.localeCompare(b)))
  })

  it('should sort QR codes by title in descending order', async () => {
    const response = await request(app)
      .get('/api/qr?sortBy=title&sortOrder=desc')
      .set('Authorization', `Bearer ${tokenOne}`)

    expect(response.status).toBe(200)

    const titles = response.body.data.qrCodes.map((qr) => qr.title)

    expect(titles).toEqual(
      [...titles].sort((a, b) => b.localeCompare(a)),
    )
  })

  it('should sort QR codes by creation date in descending order by default', async () => {
    const response = await request(app)
      .get('/api/qr')
      .set('Authorization', `Bearer ${tokenOne}`)

    expect(response.status).toBe(200)

    const dates = response.body.data.qrCodes.map(
      (qr) => new Date(qr.created_at).getTime(),
    )

    expect(dates).toEqual([...dates].sort((a, b) => b - a))
  })

  it('should sort QR codes by last updated date', async () => {
    const response = await request(app)
      .get('/api/qr?sortBy=updatedAt&sortOrder=desc')
      .set('Authorization', `Bearer ${tokenOne}`)

    expect(response.status).toBe(200)

    const dates = response.body.data.qrCodes.map(
      (qr) => new Date(qr.updated_at).getTime(),
    )

    expect(dates).toEqual([...dates].sort((a, b) => b - a))
  })

  it('should reject an invalid sort field', async () => {
    const response = await request(app)
      .get('/api/qr?sortBy=invalid')
      .set('Authorization', `Bearer ${tokenOne}`)

    expect(response.status).toBe(400)
  })

  it('should reject an invalid sort direction', async () => {
    const response = await request(app)
      .get('/api/qr?sortOrder=random')
      .set('Authorization', `Bearer ${tokenOne}`)

    expect(response.status).toBe(400)
  })
})

afterAll(async () => {
  await pool.query(
    'DELETE FROM qr_codes WHERE id = ANY($1::uuid[])',
    [[paginationQrIdOne, paginationQrIdTwo].filter(Boolean)],
  )

  await pool.query(
    'DELETE FROM users WHERE email = ANY($1::text[])',
    [[userOne.email, userTwo.email]],
  )

  await pool.end()
})
