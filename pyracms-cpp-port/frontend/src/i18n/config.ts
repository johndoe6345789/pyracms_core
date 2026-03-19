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
