import { buildCsp } from '../../../security-headers'
import { GITHUB_REPO, releasesUrl, repoUrl } from '@/lib/repo'

describe('GitHub release lookup', () => {
  it('is allowed by connect-src only', () => {
    const csp = buildCsp('https://api.example.com')
    const d = (n: string) =>
      csp.split('; ').find((x) => x.startsWith(n + ' ')) ?? ''
    expect(d('connect-src')).toContain('https://api.github.com')
    expect(d('script-src')).not.toContain('github')
  })
  it('defaults the repo and is overridable per call', () => {
    expect(GITHUB_REPO).toBe('johndoe6345789/pyracms_core')
    expect(repoUrl()).toBe('https://github.com/johndoe6345789/pyracms_core')
    expect(releasesUrl('a/b')).toBe('https://github.com/a/b/releases')
  })
})
