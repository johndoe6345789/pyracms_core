import { screen, waitFor } from '@testing-library/react'
import TenantDrawer from '@/components/layout/TenantDrawer'
import { tenantSections } from '@/components/layout/navConfig'
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

describe('site burger drawer', () => {
  it('shows the owner links first, then Explore', async () => {
    menuApi(get, ownerItems)
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
