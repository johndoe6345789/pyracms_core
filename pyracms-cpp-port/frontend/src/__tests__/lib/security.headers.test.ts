import { securityHeaders, buildCsp } from '../../../security-headers'

describe('security headers', () => {
  const h = Object.fromEntries(
    securityHeaders('http://api.test:8080', false)
      .map((x) => [x.key, x.value]),
  )
  it('sets the standard set', () => {
    expect(h['X-Frame-Options']).toBe('DENY')
    expect(h['X-Content-Type-Options']).toBe('nosniff')
    expect(h['Referrer-Policy']).toBeTruthy()
    expect(h['Permissions-Policy']).toContain('camera=()')
    expect(h['Strict-Transport-Security']).toContain('max-age')
  })
  it('builds a strict CSP', () => {
    const c = h['Content-Security-Policy']
    expect(c).toContain("frame-ancestors 'none'")
    expect(c).toContain('ws://api.test:8080')
    expect(c).not.toContain('unsafe-eval')
    expect(buildCsp(undefined, true)).toContain('unsafe-eval')
    expect(buildCsp('not a url')).toContain("default-src 'self'")
  })
  it('defaults dev from NODE_ENV', () => {
    expect(securityHeaders()[0]?.value).toContain('script-src')
  })
})
