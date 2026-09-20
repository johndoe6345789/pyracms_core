import { screen, fireEvent, waitFor, within } from '@testing-library/react'
import TenantAppBar from '@/components/layout/TenantAppBar'
import TenantDrawer from '@/components/layout/TenantDrawer'
import { tenantSections } from '@/components/layout/navConfig'
import { renderWithStore } from '../../helpers/renderWithStore'
import { invalidateSiteMenu } from '@/hooks/useSiteMenu'

jest.mock('next/navigation', () => ({
  usePathname: () => '/site/d',
  useParams: () => ({ slug: 'd' }),
  useRouter: () => ({ push: jest.fn() }),
}))
jest.mock('@/hooks/useTenantId', () => ({
  useTenantId: () => ({ tenantId: 7, loading: false }),
}))
jest.mock('@/components/common/GlobalSearch', () => ({
  GlobalSearch: () => null,
}))
jest.mock('@/components/common/UserBubble', () => () => null)
jest.mock('@/components/common/NotificationBell', () => () => null)
jest.mock('@/components/common/ThemeToggle', () => () => null)
jest.mock('@/components/common/LanguageSelect', () => () => null)

const get = jest.fn()
jest.mock('@/lib/api', () => ({
  __esModule: true,
  default: { get: (u: string) => get(u) },
}))

const respond = (items: object[]) =>
  get.mockImplementation((u: string) =>
    Promise.resolve({
      data: u.includes('/items')
        ? items
        : u.includes('menu-groups')
          ? [{ id: 1, name: 'main' }]
          : [],
    }),
  )
const mine = [
  { id: 1, name: 'Contact us', routePath: '/contact', position: 2 },
  { id: 2, name: 'Our story', routePath: '/about', position: 1 },
]

beforeEach(() => {
  jest.clearAllMocks()
  invalidateSiteMenu()
})

describe('site navigation', () => {
  it("puts the owner's links along the top, in their words and order", async () => {
    respond(mine)
    renderWithStore(
      <TenantAppBar
        slug="d"
        siteName="Demo"
        drawerOpen={false}
        onMenuClick={jest.fn()}
      />,
    )
    const story = await screen.findByText('Our story')
    expect(story.closest('a')).toHaveAttribute('href', '/site/d/about')
    const links = screen.getAllByRole('link').map((l) => l.textContent)
    expect(links.indexOf('Our story')).toBeLessThan(links.indexOf('Contact us'))
    // the stock links are not in the top row any more
    expect(screen.queryByTestId('nav-articles')).toBeNull()
  })

  it('keeps the stock links in an Explore dropdown', async () => {
    respond(mine)
    renderWithStore(
      <TenantAppBar
        slug="d"
        siteName="Demo"
        drawerOpen={false}
        onMenuClick={jest.fn()}
      />,
    )
    await screen.findByText('Our story')
    fireEvent.click(screen.getByTestId('nav-explore'))
    const menu = await screen.findByRole('menu')
    for (const label of [
      'Articles',
      'Forum',
      'Gallery',
      'Code',
      'Tags',
      'Search',
    ])
      expect(within(menu).getByText(label)).toBeInTheDocument()
    // Hypernucleus is a titled group with its own links
    expect(within(menu).getByText('Hypernucleus')).toBeInTheDocument()
    expect(within(menu).getByText('Games')).toBeInTheDocument()
  })

  it('gives a site with no menu a way home', async () => {
    respond([])
    renderWithStore(
      <TenantAppBar
        slug="d"
        siteName="Demo"
        drawerOpen={false}
        onMenuClick={jest.fn()}
      />,
    )
    expect(await screen.findByText('Home')).toBeInTheDocument()
    expect(screen.getByTestId('nav-explore')).toBeInTheDocument()
  })

  it('shows the owner links first in the burger drawer', async () => {
    respond(mine)
    renderWithStore(
      <TenantDrawer
        slug="d"
        siteName="Demo"
        canAdmin={false}
        open
        onClose={jest.fn()}
      />,
    )
    await screen.findByText('Our story')
    const titles = screen
      .getAllByRole('navigation')
      .map((n) => n.getAttribute('aria-label'))
    expect(titles.slice(0, 2)).toEqual(['Menu', 'Explore'])
    await waitFor(() =>
      expect(screen.getByText('Contact us')).toBeInTheDocument(),
    )
  })
})

describe('tenantSections', () => {
  const own = [{ key: 'menu-1', label: 'Ours', href: '/site/d/x', icon: null }]
  it('leads with the owner links when there are some', () => {
    const s = tenantSections('d', false, null, own)
    expect(s.map((x) => x.title)).toEqual(['Menu', 'Explore'])
    expect(s[0]?.items.map((i) => i.label)).toEqual(['Home', 'Ours'])
  })
  it('keeps Home inside Explore when the owner has no links', () => {
    const s = tenantSections('d', true)
    expect(s.map((x) => x.title)).toEqual(['Explore', 'Manage'])
    expect(s[0]?.items[0]?.label).toBe('Home')
  })
})
