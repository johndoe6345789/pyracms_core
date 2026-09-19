import { locales, defaultLocale, localeNames } from '@/i18n/config'
import { config } from '@/middleware'

jest.mock('next-intl/routing', () => ({
  defineRouting: (c: unknown) => c,
}))
jest.mock('next-intl/navigation', () => ({
  createNavigation: (r: unknown) => ({ routing: r, Link: 'a',
    redirect: jest.fn(), usePathname: jest.fn(), useRouter: jest.fn(),
    getPathname: jest.fn() }),
}))
jest.mock('next-intl/server', () => ({
  getRequestConfig: (fn: unknown) => fn,
}))

describe('i18n config', () => {
  it('names every locale and defaults to English', () => {
    expect(defaultLocale).toBe('en')
    expect(Object.keys(localeNames).sort()).toEqual([...locales].sort())
  })

  it('builds routing and navigation from the config', () => {
    const { routing } = jest.requireActual('@/i18n/routing')
    expect(routing).toMatchObject({ defaultLocale: 'en',
      localePrefix: 'as-needed' })
    const nav = jest.requireActual('@/i18n/navigation')
    expect(nav.Link).toBe('a')
    expect(Object.keys(nav)).toHaveLength(5)
    Object.values(nav).forEach((v) => expect(v).toBeDefined())
  })

  it('has middleware disabled', () => {
    expect(config.matcher).toEqual([])
  })
})

describe('i18n request config', () => {
  const load = () => jest.requireActual('@/i18n/request').default as
    (a: { requestLocale: Promise<string | undefined> }) =>
      Promise<{ locale: string; messages: Record<string, unknown> }>

  it('loads messages for a supported locale', async () => {
    const r = await load()({ requestLocale: Promise.resolve('de') })
    expect(r.locale).toBe('de')
    expect(Object.keys(r.messages).length).toBeGreaterThan(0)
  })

  it.each([undefined, 'xx'])('falls back to English for %s', async (l) => {
    const r = await load()({ requestLocale: Promise.resolve(l) })
    expect(r.locale).toBe('en')
  })
})
