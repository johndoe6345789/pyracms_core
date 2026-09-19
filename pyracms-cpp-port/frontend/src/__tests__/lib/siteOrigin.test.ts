import { siteOrigin, serverApiOrigin, tenantIdOf } from '@/lib/siteOrigin'
import { headers } from 'next/headers'

jest.mock('next/headers', () => ({ headers: jest.fn() }))
const hdr = headers as jest.Mock
const fetchMock = jest.fn()
beforeEach(() => {
  jest.resetAllMocks()
  delete process.env.NEXT_PUBLIC_SITE_URL
  delete process.env.API_URL
  global.fetch = fetchMock as unknown as typeof fetch
})

describe('siteOrigin', () => {
  it('prefers the configured URL and trims a trailing slash', async () => {
    process.env.NEXT_PUBLIC_SITE_URL = 'https://x.test/'
    expect(await siteOrigin()).toBe('https://x.test')
  })
  it('falls back to the forwarded host and protocol', async () => {
    hdr.mockResolvedValue(new Headers({
      'x-forwarded-host': 'a.test', 'x-forwarded-proto': 'https' }))
    expect(await siteOrigin()).toBe('https://a.test')
    hdr.mockResolvedValue(new Headers({ host: 'b.test' }))
    expect(await siteOrigin()).toBe('http://b.test')
  })
  it('is empty with no host or outside a request', async () => {
    hdr.mockResolvedValue(new Headers())
    expect(await siteOrigin()).toBe('')
    hdr.mockRejectedValue(new Error('no request'))
    expect(await siteOrigin()).toBe('')
  })
})

describe('server api helpers', () => {
  it('reads the backend origin', () => {
    process.env.API_URL = 'http://backend:8080/'
    expect(serverApiOrigin()).toBe('http://backend:8080')
  })
  it('looks a tenant id up by slug', async () => {
    process.env.API_URL = 'http://b'
    fetchMock.mockResolvedValueOnce({ ok: true, json: async () => ({ id: 9 }) })
    expect(await tenantIdOf('a b')).toBe(9)
    expect(fetchMock.mock.calls[0][0]).toBe('http://b/api/tenants/a%20b')
    fetchMock.mockResolvedValueOnce({ ok: true, json: async () => ({}) })
    expect(await tenantIdOf('x')).toBeNull()
    fetchMock.mockResolvedValueOnce({ ok: false })
    expect(await tenantIdOf('x')).toBeNull()
    fetchMock.mockRejectedValueOnce(new Error('down'))
    expect(await tenantIdOf('x')).toBeNull()
  })
})
