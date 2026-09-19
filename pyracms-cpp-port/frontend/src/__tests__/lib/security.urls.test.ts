import { safeHref, safeSrc } from '@/lib/safeUrl'
import { sanitizeHtml } from '@/lib/sanitize'

describe('safeHref / safeSrc', () => {
  it.each([
    'javascript:alert(1)', ' JaVa\tScRiPt:alert(1)', 'data:text/html,x',
    'vbscript:x', '//evil.com', '\\evil.com', '', 'file:///etc/passwd',
  ])('rejects %j', (u) => {
    expect(safeHref(u)).toBeUndefined()
  })
  it('rejects non strings', () => {
    expect(safeHref(null)).toBeUndefined()
    expect(safeSrc(5)).toBeUndefined()
  })
  it('accepts normal links', () => {
    expect(safeHref('https://a.com/x')).toBe('https://a.com/x')
    expect(safeHref('/site/x')).toBe('/site/x')
    expect(safeHref('mailto:a@b.c')).toBe('mailto:a@b.c')
  })
  it('limits media schemes', () => {
    expect(safeSrc('mailto:a@b.c')).toBeUndefined()
    expect(safeSrc('data:image/svg+xml;base64,AAAA')).toBeUndefined()
    expect(safeSrc('data:image/png;base64,AAAA')).toContain('data:image/png')
    expect(safeSrc('https://a.com/i.png')).toBe('https://a.com/i.png')
  })
})

describe('sanitizeHtml', () => {
  it('strips scripts, handlers, style and forms', () => {
    const out = sanitizeHtml(
      '<img src=x onerror=alert(1)><script>x()</script>'
      + '<a href="javascript:x()">a</a><p style="position:fixed">p</p>'
      + '<form action="/x"><input></form><iframe src="//e"></iframe>',
    )
    expect(out).not.toMatch(/onerror|script|javascript:|style=|form|iframe/i)
  })
  it('forces rel on target links', () => {
    expect(sanitizeHtml('<a href="https://a.b" target="_blank">x</a>'))
      .toContain('noopener noreferrer')
  })
  it('optionally keeps style', () => {
    expect(sanitizeHtml('<b style="color:red">x</b>', true)).toContain('style')
  })
  it('returns empty when no DOM available', () => {
    const DP = jest.requireActual('dompurify')
    const orig = Object.getOwnPropertyDescriptor(DP, 'isSupported')
    Object.defineProperty(DP, 'isSupported',
      { value: false, configurable: true })
    expect(sanitizeHtml('<b>x</b>')).toBe('')
    if (orig) Object.defineProperty(DP, 'isSupported', orig)
    else delete DP.isSupported
  })
})
