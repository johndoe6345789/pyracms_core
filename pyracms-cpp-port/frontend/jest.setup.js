import '@testing-library/jest-dom'

// next-intl is ESM and needs a provider: tests get the English messages.
jest.mock('next-intl', () => {
  const en = require('./src/i18n/messages/en.json')
  const lookup = (ns, key) => [ns, key].filter(Boolean).join('.')
    .split('.').reduce((o, k) => (o ? o[k] : undefined), en)
  return {
    useLocale: () => 'en',
    NextIntlClientProvider: ({ children }) => children,
    useTranslations: (ns) => (key, values = {}) =>
      Object.entries(values).reduce(
        (s, [k, v]) => s.replace(`{${k}}`, String(v)),
        lookup(ns, key) ?? key),
  }
})
