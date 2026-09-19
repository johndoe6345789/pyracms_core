import { buildCsp } from '../../../security-headers'

const part = (csp: string, name: string) =>
  csp.split('; ').find((d) => d.startsWith(name + ' ')) ?? ''

describe('CSP allows Cloudflare web analytics', () => {
  const csp = buildCsp('https://api.example.com')

  it('loads its beacon script', () => {
    expect(part(csp, 'script-src')).toContain(
      'https://static.cloudflareinsights.com',
    )
  })

  it('reports back to cloudflareinsights.com', () => {
    expect(part(csp, 'connect-src')).toContain('https://cloudflareinsights.com')
  })

  it('still blocks other third-party scripts', () => {
    expect(part(csp, 'script-src')).not.toContain('https://evil.example')
    expect(part(csp, 'script-src')).not.toContain(' *')
  })
})
