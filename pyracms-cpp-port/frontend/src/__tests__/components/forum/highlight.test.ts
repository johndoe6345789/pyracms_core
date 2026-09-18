import { highlightMatch } from '@/components/forum/highlight'

describe('highlightMatch', () => {
  it('wraps matches and escapes regex characters', () => {
    expect(highlightMatch('a.b a.b', 'a.b'))
      .toBe('<mark>a.b</mark> <mark>a.b</mark>')
  })
  it('strips scripts and skips empty queries', () => {
    expect(highlightMatch('<img src=x onerror=alert(1)>hi', ''))
      .not.toContain('onerror')
  })
})
