import {
  menuEntries,
  menuHref,
  menuItemVisible,
} from '@/components/layout/siteMenu'

const item = (id: number, over: object = {}) => ({
  id,
  name: `Link ${id}`,
  route: '/about',
  position: id,
  permissions: 'public',
  ...over,
})
const guest = { signedIn: false, canAdmin: false }
const member = { signedIn: true, canAdmin: false }
const admin = { signedIn: true, canAdmin: true }

describe('menuHref', () => {
  it.each([
    ['/', '/site/d'],
    ['/about', '/site/d/about'],
    ['about/us', '/site/d/about/us'],
    ['https://x.io/a', 'https://x.io/a'],
    ['mailto:a@b.co', 'mailto:a@b.co'],
  ])('%s -> %s', (route, href) => {
    expect(menuHref('d', route)).toBe(href)
  })

  it.each(['javascript:alert(1)', 'data:text/html,x', '//evil.io', ''])(
    'refuses %p',
    (route) => {
      expect(menuHref('d', route)).toBeNull()
    },
  )
})

describe('menuItemVisible', () => {
  it('follows the permission level', () => {
    expect(menuItemVisible('public', guest)).toBe(true)
    expect(menuItemVisible('authenticated', guest)).toBe(false)
    expect(menuItemVisible('authenticated', member)).toBe(true)
    expect(menuItemVisible('admin', member)).toBe(false)
    expect(menuItemVisible('admin', admin)).toBe(true)
    expect(menuItemVisible('mystery', admin)).toBe(false)
  })
})

describe('menuEntries', () => {
  it('uses the owner wording, in position order', () => {
    const out = menuEntries(
      'd',
      [item(2, { name: 'Contact us', position: 1 }), item(1, { position: 5 })],
      guest,
    )
    expect(out.map((e) => e.label)).toEqual(['Contact us', 'Link 1'])
    expect(out[0]?.href).toBe('/site/d/about')
  })

  it('hides what the visitor may not see, and unusable links', () => {
    const items = [
      item(1),
      item(2, { permissions: 'authenticated' }),
      item(3, { permissions: 'admin' }),
      item(4, { route: 'javascript:x' }),
      item(5, { name: '   ' }),
    ]
    expect(menuEntries('d', items, guest)).toHaveLength(1)
    expect(menuEntries('d', items, member)).toHaveLength(2)
    expect(menuEntries('d', items, admin)).toHaveLength(3)
  })

  it('marks links that leave the site', () => {
    const [ext] = menuEntries('d', [item(1, { route: 'https://x.io' })], guest)
    expect(ext?.external).toBe(true)
    const [own] = menuEntries('d', [item(1)], guest)
    expect(own?.external).toBeUndefined()
  })
})
