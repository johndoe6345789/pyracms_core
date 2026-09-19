import {
  scopeFromPath, setToken, getToken, clearToken, currentToken,
  replaceToken,
} from '@/lib/session'

describe('per-scope sessions', () => {
  beforeEach(() => localStorage.clear())

  it('reads the site slug from a site path', () => {
    expect(scopeFromPath('/site/acme/forum')).toBe('acme')
    expect(scopeFromPath('/')).toBeNull()
    expect(scopeFromPath('/auth/login')).toBeNull()
  })

  it('keeps a separate token per site', () => {
    setToken('demo', 'demo-token')
    setToken('acme', 'acme-token')
    expect(getToken('demo')).toBe('demo-token')
    expect(getToken('acme')).toBe('acme-token')
  })

  it('signing out of one site leaves the other signed in', () => {
    setToken('demo', 'demo-token')
    setToken('acme', 'acme-token')
    clearToken('demo')
    expect(getToken('demo')).toBeNull()
    expect(getToken('acme')).toBe('acme-token')
  })

  it('falls back to the platform token on a site with no session', () => {
    setToken(null, 'platform-token')
    expect(getToken('demo')).toBe('platform-token')
  })

  it('prefers the site token over the platform token', () => {
    setToken(null, 'platform-token')
    setToken('demo', 'demo-token')
    expect(getToken('demo')).toBe('demo-token')
  })

  it('logging out of a site does not drop the platform session', () => {
    setToken(null, 'platform-token')
    setToken('demo', 'demo-token')
    clearToken('demo')
    expect(getToken(null)).toBe('platform-token')
  })
})

describe('session helpers', () => {
  beforeEach(() => localStorage.clear())

  it('currentToken reads the token for the window path', () => {
    setToken(null, 'p')
    expect(currentToken()).toBe('p')
  })

  it('returns null when storage throws', () => {
    const spy = jest.spyOn(Storage.prototype, 'getItem')
      .mockImplementation(() => { throw new Error('x') })
    expect(getToken('a')).toBeNull()
    spy.mockRestore()
  })
})

describe('replaceToken', () => {
  beforeEach(() => localStorage.clear())

  it('overwrites the token the scope is actually using', () => {
    setToken(null, 'platform-old')
    replaceToken('demo', 'platform-new')
    expect(getToken('demo')).toBe('platform-new')
    expect(localStorage.getItem('token')).toBe('platform-new')
    expect(localStorage.getItem('token:demo')).toBeNull()
  })

  it('writes the scope key when nothing is stored yet', () => {
    replaceToken('demo', 'fresh')
    expect(localStorage.getItem('token:demo')).toBe('fresh')
  })
})
