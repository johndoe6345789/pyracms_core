import { safeHref, safeSrc } from '@/lib/safeUrl'
import { sanitizeHtml } from '@/lib/sanitize'
import { jsonLdString } from '@/lib/jsonLd'
import { parseTurbologin } from '@/lib/turbologin'
import { safeRedirect } from '@/hooks/useAuthParams'
import { buildWsUrl } from '@/hooks/wsUrl'
import { renderBBCode } from '@/components/articles/bbcodeRenderer'
import { highlightMatch } from '@/components/forum/highlight'
import { pickTheme, DEFAULT_THEME } from '@/components/admin/styles/themeConfig'
import { securityHeaders, buildCsp } from '../../../security-headers'

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
    Object.defineProperty(DP, 'isSupported', { value: false, configurable: true })
    expect(sanitizeHtml('<b>x</b>')).toBe('')
    if (orig) Object.defineProperty(DP, 'isSupported', orig)
    else delete DP.isSupported
  })
})

describe('bbcode', () => {
  it('blocks script urls and attribute breakout', () => {
    const out = renderBBCode(
      '[url=javascript:alert(1)]x[/url][img]javascript:1[/img]'
      + '[img]https://a.b/x.png" onerror="alert(1)[/img]'
      + '[color=red;position:fixed]y[/color][size=9;x]z[/size]',
    )
    const d = document.createElement('div')
    d.innerHTML = out
    expect(out).not.toMatch(/javascript:/i)
    d.querySelectorAll('*').forEach((el) => {
      expect(el.getAttribute('style') ?? '').not.toMatch(/position/)
      expect(el.getAttributeNames().some((n) => n.startsWith('on'))).toBe(false)
    })
  })
  it('renders safe urls', () => {
    expect(renderBBCode('[url]https://a.b[/url]')).toContain('href="https://a.b"')
  })
})

describe('other helpers', () => {
  it('escapes JSON-LD', () => {
    const s = jsonLdString({ a: '</script><script>x</script>&\u2028' })
    expect(s).not.toContain('<')
    expect(JSON.parse(s).a).toContain('</script>')
  })
  it('rejects tricky turbologins', () => {
    for (const raw of ['null', '[]', '"x"', '{"user":{},"pass":"p"}',
      '{"user":"u","pass":1}', `{"user":"${'a'.repeat(5000)}"}`]) {
      expect(parseTurbologin(raw).ok).toBe(false)
    }
    expect(parseTurbologin('{"__proto__":{"x":1},"user":"u","pass":"p"}'))
      .toEqual({ ok: true, user: 'u', pass: 'p' })
    expect(({} as Record<string, unknown>).x).toBeUndefined()
  })
  it('rejects open redirects', () => {
    for (const v of ['//e.com', '/\\e.com', 'https://e.com', '/a\nb', 'x'])
      expect(safeRedirect(v)).toBeUndefined()
    expect(safeRedirect('/site/a?x=1')).toBe('/site/a?x=1')
  })
  it('encodes ws token', () => {
    expect(buildWsUrl('http://h/ws', 'a&b=c')).toBe('ws://h/ws?token=a%26b%3Dc')
  })
  it('highlight is sanitised', () => {
    expect(highlightMatch('<img src=x onerror=1>hi', 'hi')).not.toMatch(/onerror/)
  })
  it('theme import keeps only known typed keys', () => {
    const t = pickTheme(JSON.parse('{"__proto__":{"a":1},"x":1,"fontFamily":5}'))
    expect(t).toEqual(DEFAULT_THEME)
    expect(pickTheme(null)).toEqual(DEFAULT_THEME)
    const key = Object.keys(DEFAULT_THEME)[0] as keyof typeof DEFAULT_THEME
    const v = DEFAULT_THEME[key]
    expect(pickTheme({ [key]: v })[key]).toBe(v)
  })
})

describe('security headers', () => {
  const h = Object.fromEntries(
    securityHeaders('http://api.test:8080', false).map((x) => [x.key, x.value]),
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
