import { jsonLdString } from '@/lib/jsonLd'
import { parseTurbologin } from '@/lib/turbologin'
import { safeRedirect } from '@/hooks/useAuthParams'
import { buildWsUrl } from '@/hooks/wsUrl'
import { renderBBCode } from '@/components/articles/bbcodeRenderer'
import { highlightMatch } from '@/components/forum/highlight'
import { pickTheme, DEFAULT_THEME } from '@/components/admin/styles/themeConfig'

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
      expect(el.getAttributeNames().some((n) => n.startsWith('on')))
        .toBe(false)
    })
  })
  it('renders safe urls', () => {
    expect(renderBBCode('[url]https://a.b[/url]'))
      .toContain('href="https://a.b"')
  })
})

describe('other helpers', () => {
  it('escapes JSON-LD', () => {
    const s = jsonLdString({ a: '</script><script>x</script>& ' })
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
    expect(buildWsUrl('http://h/ws', 'a&b=c'))
      .toBe('ws://h/ws?token=a%26b%3Dc')
  })
  it('highlight is sanitised', () => {
    expect(highlightMatch('<img src=x onerror=1>hi', 'hi'))
      .not.toMatch(/onerror/)
  })
  it('theme import keeps only known typed keys', () => {
    const t = pickTheme(
      JSON.parse('{"__proto__":{"a":1},"x":1,"fontFamily":5}'))
    expect(t).toEqual(DEFAULT_THEME)
    expect(pickTheme(null)).toEqual(DEFAULT_THEME)
    const key = Object.keys(DEFAULT_THEME)[0] as keyof typeof DEFAULT_THEME
    const v = DEFAULT_THEME[key]
    expect(pickTheme({ [key]: v })[key]).toBe(v)
  })
})
