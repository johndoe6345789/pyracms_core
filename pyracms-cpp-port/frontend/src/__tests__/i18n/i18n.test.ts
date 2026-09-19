import {
  locales, defaultLocale, localeNames, isLocale, resolveLocale,
} from '@/i18n/config'

let cookie: string | undefined
jest.mock('next/headers', () => ({
  cookies: async () => ({
    get: () => (cookie === undefined ? undefined : { value: cookie }),
  }),
}))
jest.mock('next-intl/server', () => ({
  getRequestConfig: (fn: unknown) => fn,
}))

describe('i18n config', () => {
  it('names every locale and defaults to English', () => {
    expect(defaultLocale).toBe('en')
    expect(Object.keys(localeNames).sort()).toEqual([...locales].sort())
  })

  it('validates locales', () => {
    expect(isLocale('fr')).toBe(true)
    expect(isLocale('xx')).toBe(false)
    expect(resolveLocale('cy')).toBe('cy')
    expect(resolveLocale(undefined)).toBe('en')
  })

  it('has a message file with the same top-level keys per locale', () => {
    const en = Object.keys(require('@/i18n/messages/en.json')).sort()
    locales.forEach((l) => {
      const m = require(`@/i18n/messages/${l}.json`)
      expect(Object.keys(m).sort()).toEqual(en)
      expect(m.common.language).toBeTruthy()
    })
  })
})

describe('i18n request config', () => {
  const load = () => jest.requireActual('@/i18n/request').default as
    () => Promise<{ locale: string; messages: Record<string, unknown> }>

  it('reads the locale from the cookie', async () => {
    cookie = 'de'
    const r = await load()()
    expect(r.locale).toBe('de')
    expect(Object.keys(r.messages).length).toBeGreaterThan(0)
  })

  it.each([undefined, 'xx'])('falls back to English for %s', async (c) => {
    cookie = c
    expect((await load()()).locale).toBe('en')
  })
})
