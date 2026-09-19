import en from '@/i18n/messages/en.json'
import requestConfig from '@/i18n/request'
import {
  locales,
  defaultLocale,
  localeNames,
  isLocale,
  resolveLocale,
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

  it('has a message file with the same top-level keys per locale', async () => {
    const keys = Object.keys(en).sort()
    for (const l of locales) {
      const m = (await import(`@/i18n/messages/${l}.json`)).default
      expect(Object.keys(m).sort()).toEqual(keys)
      expect(m.common.language).toBeTruthy()
    }
  })
})

describe('i18n request config', () => {
  const load = () =>
    requestConfig as unknown as () => Promise<{
      locale: string
      messages: Record<string, unknown>
    }>

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
