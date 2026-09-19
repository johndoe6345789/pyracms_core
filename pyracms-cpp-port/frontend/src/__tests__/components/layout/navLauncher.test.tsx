import { render, screen } from '@testing-library/react'
import TopBarTools from '@/components/layout/TopBarTools'
import AppDrawer from '@/components/layout/AppDrawer'
import LibraryHeader from '@/components/launcher/LibraryHeader'
import { tenantSections, portalSections } from '@/components/layout/navConfig'

jest.mock('next/navigation', () => ({
  usePathname: () => '/',
  useRouter: () => ({ push: jest.fn() }),
  useParams: () => ({}),
}))
jest.mock('@/components/common/GlobalSearch', () => ({
  GlobalSearch: () => null,
}))
jest.mock('@/components/common/UserBubble', () => () => null)
jest.mock('@/components/common/NotificationBell', () => () => null)
jest.mock('@/components/common/ThemeToggle', () => () => null)
jest.mock('@/components/common/LanguageSelect', () => () => null)

describe('Get the launcher entries', () => {
  it('top bar tool defaults to /download, site passes its own', () => {
    const { unmount } = render(<TopBarTools />)
    expect(screen.getByTestId('get-launcher')).toHaveAttribute(
      'href',
      '/download',
    )
    unmount()
    render(<TopBarTools downloadHref="/site/d/download" />)
    expect(screen.getByLabelText('Get the launcher')).toHaveAttribute(
      'href',
      '/site/d/download',
    )
  })

  it('portal and site drawers list it, top-bar links do not', () => {
    const p = portalSections(false)[0]!.items
    expect(p.find((e) => e.key === 'download')?.href).toBe('/download')
    const t = tenantSections('d', false)[0]!.items
    expect(t.find((e) => e.key === 'download')?.href).toBe('/site/d/download')
    render(
      <AppDrawer
        open
        onClose={() => {}}
        title="T"
        subtitle="S"
        sections={tenantSections('d', false)}
      />,
    )
    expect(screen.getByTestId('drawer-download')).toHaveTextContent(
      'Get the launcher',
    )
  })

  it('games header shows the banner only with a download href', () => {
    const base = {
      mobile: false,
      view: 'browse',
      onView: jest.fn(),
      onOpenDrawer: jest.fn(),
    } as const
    const { rerender } = render(<LibraryHeader {...base} />)
    expect(screen.queryByTestId('get-launcher-banner')).toBeNull()
    rerender(<LibraryHeader {...base} downloadHref="/site/d/download" />)
    expect(screen.getByTestId('get-launcher-link')).toHaveAttribute(
      'href',
      '/site/d/download',
    )
  })
})
