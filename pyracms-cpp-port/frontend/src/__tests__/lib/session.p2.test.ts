import { setToken, getToken, currentToken, replaceToken } from '@/lib/session'

describe('session helpers', () => {
  beforeEach(() => localStorage.clear())

  it('currentToken reads the token for the window path', () => {
    setToken(null, 'p')
    expect(currentToken()).toBe('p')
  })

  it('returns null when storage throws', () => {
    const spy = jest
      .spyOn(Storage.prototype, 'getItem')
      .mockImplementation(() => {
        throw new Error('x')
      })
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
