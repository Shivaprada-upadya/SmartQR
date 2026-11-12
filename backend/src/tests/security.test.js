import { describe, it, expect } from 'vitest'
import request from 'supertest'

import app from '../app.js'

describe('API Security Headers and CORS', () => {
  it('should include Content Security Policy headers', async () => {
    const response = await request(app)
      .get('/api/health')

    expect(response.status).toBe(200)

    const csp = response.headers['content-security-policy']

    expect(csp).toBeDefined()
    expect(csp).toContain("default-src 'self'")
    expect(csp).toContain("object-src 'none'")
  })

  it('should prevent MIME type sniffing', async () => {
    const response = await request(app)
      .get('/api/health')

    expect(response.headers['x-content-type-options']).toBe('nosniff')
  })

  it('should include a Referrer Policy header', async () => {
    const response = await request(app)
      .get('/api/health')

    expect(response.headers['referrer-policy']).toBeDefined()
  })

  it('should allow requests from the configured frontend origin', async () => {
    const response = await request(app)
      .get('/api/health')
      .set('Origin', process.env.CLIENT_URL)

    expect(response.headers['access-control-allow-origin'])
      .toBe(process.env.CLIENT_URL)
  })

  it('should not allow an unconfigured frontend origin', async () => {
    const response = await request(app)
      .get('/api/health')
      .set('Origin', 'https://untrusted-example.com')

    expect(response.headers['access-control-allow-origin'])
      .toBeUndefined()
  })
})
