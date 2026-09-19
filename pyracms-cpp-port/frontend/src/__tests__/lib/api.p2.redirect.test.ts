import { setToken } from '@/lib/session'
import {
  res,
  nav,
  setLocation,
  installFakeLocation,
} from '../helpers/apiInterceptors'

installFakeLocation()

describe('api interceptors', () => {
  it('sends a 401 on a site back to that site login', async () => {
    setToken('demo', 'tok')
    const err = { response: { status: 401 }, config: { url: '/api/x' } }
    await expect(res().rejected(err)).rejects.toBe(err)
    expect(nav.assigned).toBe('/auth/login?tenant=demo')
    expect(localStorage.getItem('token:demo')).toBeNull()
  })

  it('sends a portal 401 to the platform login', async () => {
    setLocation('/')
    const err = { response: { status: 401 } }
    await expect(res().rejected(err)).rejects.toBe(err)
    expect(nav.assigned).toBe('/auth/login')
  })

  it('does not redirect for auth endpoints or other errors', async () => {
    const auth = { response: { status: 401 }, config: { url: '/api/auth/me' } }
    await expect(res().rejected(auth)).rejects.toBe(auth)
    const other = { response: { status: 500 } }
    await expect(res().rejected(other)).rejects.toBe(other)
    expect(nav.assigned).toBe('')
  })
})
