/** @jest-environment node */
import '../helpers/apiEnv'
import { api } from '@/store/api'
import { installFetch, run } from '../helpers/storeApiRun'

beforeEach(installFetch)

describe('rtk-query api', () => {
  it('sends the bearer token when signed in', async () => {
    const req = await run(() => api.endpoints.getMe.initiate(), true)
    expect(req.url).toBe('http://api.test/api/auth/me')
    expect(req.headers.get('Authorization')).toBe('Bearer tok')
    expect(req.headers.get('Content-Type')).toBe('application/json')
  })

  it('omits the header for guests', async () => {
    const req = await run(() => api.endpoints.getUsers.initiate())
    expect(req.headers.get('Authorization')).toBeNull()
  })
})
