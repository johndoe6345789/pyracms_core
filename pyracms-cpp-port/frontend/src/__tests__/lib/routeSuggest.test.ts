import {
  ROUTE_FORMAT_HELP,
  suggestRoutes,
  validateRoute,
} from '@/lib/routeSuggest'

const values = (q: string) => suggestRoutes(q).map((s) => s.value)

describe('validateRoute', () => {
  it.each(['', '/', '/articles/welcome', 'https://a.io/x', 'mailto:a@b.c'])(
    'accepts %p',
    (r) => expect(validateRoute(r)).toBe(''),
  )

  it.each([
    ['articles', /Start with \//],
    ['/a b', /spaces/],
    ['//evil.io', /single/],
    ['javascript:alert(1)', /Only https/],
    ['ftp://x', /Only https/],
  ])('rejects %p', (r, msg) => expect(validateRoute(r)).toMatch(msg))
})

describe('suggestRoutes', () => {
  it('offers every site page when empty', () => {
    expect(values('')).toEqual(expect.arrayContaining(['/', '/forum']))
  })

  it('narrows by prefix, with or without the slash', () => {
    expect(values('/ga')).toEqual(['/gallery', '/games'])
    expect(values('ga')).toContain('/gallery')
  })

  it('matches inside a path too', () => {
    expect(values('load')).toContain('/download')
  })

  it('offers link schemes while typing one', () => {
    expect(values('ht')).toEqual(expect.arrayContaining(['https://']))
    expect(values('https://exa')).toEqual([])
  })

  it('states the format', () => {
    expect(ROUTE_FORMAT_HELP).toMatch(/\/articles/)
    expect(ROUTE_FORMAT_HELP).toMatch(/https:\/\//)
  })
})
