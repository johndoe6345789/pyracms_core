import { stashOAuth, takeOAuth, isProviderUrl } from '@/lib/oauth'

describe('oauth helpers', () => {
  beforeEach(() => sessionStorage.clear())

  it('round-trips the pending provider once', () => {
    stashOAuth('github', '/site/x')
    expect(takeOAuth()).toEqual({ provider: 'github', redirectTo: '/site/x' })
    expect(takeOAuth()).toBeNull()
  })
  it('drops unsafe redirects and bad payloads', () => {
    stashOAuth('google', '//evil.test')
    expect(takeOAuth()).toEqual({ provider: 'google' })
    sessionStorage.setItem('oauth:pending', '{oops')
    expect(takeOAuth()).toBeNull()
  })
  it('only follows http(s) provider urls', () => {
    expect(isProviderUrl('https://github.com/login')).toBe(true)
    expect(isProviderUrl('javascript:alert(1)')).toBe(false)
    expect(isProviderUrl('nope')).toBe(false)
  })
})
