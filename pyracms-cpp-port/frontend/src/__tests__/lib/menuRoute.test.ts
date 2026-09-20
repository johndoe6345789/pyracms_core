import { fromApiRoute, toApiRoute } from '@/lib/menuRoute'

describe('toApiRoute', () => {
  it('stores a page on the site as routePath', () => {
    expect(toApiRoute(' /articles ')).toEqual({
      routePath: '/articles',
      url: '',
      type: 'route',
    })
  })

  it.each(['https://x.io/a', 'HTTP://x.io', 'mailto:a@b.co'])(
    'stores %s as an outside url',
    (link) => {
      expect(toApiRoute(link)).toEqual({
        routePath: '',
        url: link,
        type: 'url',
      })
    },
  )
})

describe('fromApiRoute', () => {
  it('reads whichever field holds the link', () => {
    expect(fromApiRoute({ routePath: '/a', url: '' })).toBe('/a')
    expect(fromApiRoute({ routePath: '', url: 'https://x.io' })).toBe(
      'https://x.io',
    )
    expect(fromApiRoute({})).toBe('')
    expect(fromApiRoute({ url: 5, routePath: null })).toBe('')
  })

  it('round-trips both kinds', () => {
    for (const r of ['/about', 'https://x.io/y'])
      expect(fromApiRoute(toApiRoute(r))).toBe(r)
  })
})
