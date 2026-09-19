export const locales = ['en', 'es', 'fr', 'de', 'ja', 'zh', 'nl', 'cy'] as const
export type Locale = (typeof locales)[number]
export const defaultLocale: Locale = 'en'

export const localeNames: Record<Locale, string> = {
  en: 'English',
  es: 'Español',
  fr: 'Français',
  de: 'Deutsch',
  ja: '日本語',
  zh: '中文',
  nl: 'Nederlands',
  cy: 'Cymraeg',
}

/** Cookie the switcher writes and i18n/request.ts reads. */
export const LOCALE_COOKIE = 'NEXT_LOCALE'

export function isLocale(value: unknown): value is Locale {
  return (locales as readonly unknown[]).includes(value)
}

/** Supported locale for a cookie value, else the default. */
export function resolveLocale(value: unknown): Locale {
  return isLocale(value) ? value : defaultLocale
}
