import { screen, fireEvent, within } from '@testing-library/react'
import TenantAppBar from '@/components/layout/TenantAppBar'
import { renderWithStore } from '../../helpers/renderWithStore'
import { menuApi, ownerItems } from '../../helpers/siteNavHarness'
import { invalidateSiteMenu } from '@/hooks/useSiteMenu'

jest.mock('next/navigation', () =>
  jest.requireActual('../../helpers/siteNavHarness').navigationMock(),
)
jest.mock('@/hooks/useTenantId', () =>
  jest.requireActual('../../helpers/siteNavHarness').tenantIdMock(),
)
jest.mock('@/components/common/GlobalSearch', () =>
  jest.requireActual('../../helpers/siteNavHarness').noSearch(),
)
for (const m of [
  'UserBubble',
  'NotificationBell',
  'ThemeToggle',
  'LanguageSelect',
])
  jest.mock(`@/components/common/${m}`, () =>
    jest.requireActual('../../helpers/siteNavHarness').nothing(),
  )
const get = jest.fn()
jest.mock('@/lib/api', () => ({
  __esModule: true,
  default: { get: (u: string) => get(u) },
}))

beforeEach(() => {
  jest.clearAllMocks()
  invalidateSiteMenu()
})

const bar = () =>
  renderWithStore(
    <TenantAppBar
      slug="d"
      siteName="Demo"
      drawerOpen={false}
      onMenuClick={jest.fn()}
    />,
  )

describe('site top bar', () => {
  it('puts the owner links along the top, in their wording and order', async () => {
    menuApi(get, ownerItems)
    bar()
    const story = await screen.findByText('Our story')
    expect(story.closest('a')).toHaveAttribute('href', '/site/d/about')
    const links = screen.getAllByRole('link').map((l) => l.textContent)
    expect(links.indexOf('Our story')).toBeLessThan(links.indexOf('Contact us'))
    expect(screen.queryByTestId('nav-articles')).toBeNull()
  })

  it('keeps the stock links in an Explore dropdown', async () => {
    menuApi(get, ownerItems)
    bar()
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
    expect(within(menu).getByText('Hypernucleus')).toBeInTheDocument()
    expect(within(menu).getByText('Games')).toBeInTheDocument()
  })

  it('gives a site with no menu a way home', async () => {
    menuApi(get, [])
    bar()
    expect(await screen.findByText('Home')).toBeInTheDocument()
    expect(screen.getByTestId('nav-explore')).toBeInTheDocument()
  })
})
