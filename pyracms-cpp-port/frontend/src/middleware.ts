// next-intl middleware disabled: pages do not use [locale] route
// segments yet. The i18n setup (messages, request.ts) still works for
// useTranslations() within pages. Re-enable this middleware when
// adding [locale] route segments.

export const config = {
  matcher: [],
}
