import api from '@/lib/api'
import { setToken } from '@/lib/session'

type Handlers = {
  fulfilled: (v: never) => unknown
  rejected: (e: unknown) => unknown
}
const req = () => (api.interceptors.request as unknown as {
  handlers: Handlers[] }).handlers[0]!
const res = () => (api.interceptors.response as unknown as {
  handlers: Handlers[] }).handlers[0]!

const realLocation = window.location
let assigned = ''

beforeEach(() => {
  localStorage.clear()
  assigned = ''
  Object.defineProperty(window, 'location', {
    configurable: true,
    value: {
      pathname: '/site/demo/forum',
      set href(v: string) { assigned = v },
    },
  })
})
afterAll(() => {
  Object.defineProperty(window, 'location', {
    configurable: true, value: realLocation,
  })
})

describe('api interceptors', () => {
  it('adds the bearer token for the current scope', () => {
    setToken('demo', 'tok')
    const cfg = req().fulfilled({ headers: {} } as never) as {
      headers: { Authorization?: string } }
    expect(cfg.headers.Authorization).toBe('Bearer tok')
  })

  it('leaves the request alone without a token', () => {
    const cfg = req().fulfilled({ headers: {} } as never) as {
      headers: { Authorization?: string } }
    expect(cfg.headers.Authorization).toBeUndefined()
  })

  it('passes request errors through', async () => {
    await expect(req().rejected('boom')).rejects.toBe('boom')
  })

  it('returns successful responses untouched', () => {
    expect(res().fulfilled({ ok: 1 } as never)).toEqual({ ok: 1 })
  })

  it('sends a 401 on a site back to that site login', async () => {
    setToken('demo', 'tok')
    const err = { response: { status: 401 }, config: { url: '/api/x' } }
    await expect(res().rejected(err)).rejects.toBe(err)
    expect(assigned).toBe('/auth/login?tenant=demo')
    expect(localStorage.getItem('token:demo')).toBeNull()
  })

  it('sends a portal 401 to the platform login', async () => {
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: { pathname: '/', set href(v: string) { assigned = v } },
    })
    const err = { response: { status: 401 } }
    await expect(res().rejected(err)).rejects.toBe(err)
    expect(assigned).toBe('/auth/login')
  })

  it('does not redirect for auth endpoints or other errors', async () => {
    const auth = { response: { status: 401 }, config: { url: '/api/auth/me' } }
    await expect(res().rejected(auth)).rejects.toBe(auth)
    const other = { response: { status: 500 } }
    await expect(res().rejected(other)).rejects.toBe(other)
    expect(assigned).toBe('')
  })
})
