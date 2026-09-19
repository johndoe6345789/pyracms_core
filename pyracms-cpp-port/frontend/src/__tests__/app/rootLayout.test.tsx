import RootLayout, { metadata } from '@/app/layout'

jest.mock('next/font/google', () => ({
  Inter: () => ({ className: 'inter' }),
}))
jest.mock('@/store/StoreProvider', () => ({
  __esModule: true, default: (p: { children: React.ReactNode }) => p.children,
}))
jest.mock('@/components/common/ThemeWrapper', () => ({
  __esModule: true, default: (p: { children: React.ReactNode }) => p.children,
}))

describe('RootLayout', () => {
  it('declares metadata and wraps children', () => {
    expect(metadata.robots).toMatchObject({ index: true })
    const el = RootLayout({ children: <p>kid</p> })
    expect(el.props.lang).toBe('en')
  })
})
