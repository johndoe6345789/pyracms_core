import RootLayout, { metadata } from '@/app/layout'

jest.mock('next/font/google', () => ({
  Inter: () => ({ className: 'inter' }),
}))
jest.mock('next-intl/server', () => ({
  getLocale: async () => 'de',
  getMessages: async () => ({ common: { save: 'Speichern' } }),
}))
jest.mock('@/store/StoreProvider', () => ({
  __esModule: true, default: (p: { children: React.ReactNode }) => p.children,
}))
jest.mock('@/components/common/ThemeWrapper', () => ({
  __esModule: true, default: (p: { children: React.ReactNode }) => p.children,
}))

describe('RootLayout', () => {
  it('declares metadata and sets the html lang from the locale', async () => {
    expect(metadata.robots).toMatchObject({ index: true })
    const el = await RootLayout({ children: <p>kid</p> })
    expect(el.props.lang).toBe('de')
  })
})
