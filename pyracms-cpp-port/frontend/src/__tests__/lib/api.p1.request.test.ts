import { setToken } from '@/lib/session'
import { req, res, installFakeLocation } from '../helpers/apiInterceptors'

installFakeLocation()

type Cfg = { headers: { Authorization?: string } }

describe('api interceptors', () => {
  it('adds the bearer token for the current scope', () => {
    setToken('demo', 'tok')
    const cfg = req().fulfilled({ headers: {} } as never) as Cfg
    expect(cfg.headers.Authorization).toBe('Bearer tok')
  })

  it('leaves the request alone without a token', () => {
    const cfg = req().fulfilled({ headers: {} } as never) as Cfg
    expect(cfg.headers.Authorization).toBeUndefined()
  })

  it('passes request errors through', async () => {
    await expect(req().rejected('boom')).rejects.toBe('boom')
  })

  it('returns successful responses untouched', () => {
    expect(res().fulfilled({ ok: 1 } as never)).toEqual({ ok: 1 })
  })
})
