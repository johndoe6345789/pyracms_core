/** Shared fixtures for the site navigation tests. */

export const navigationMock = () => ({
  usePathname: () => '/site/d',
  useParams: () => ({ slug: 'd' }),
  useRouter: () => ({ push: jest.fn() }),
})

export const tenantIdMock = () => ({
  useTenantId: () => ({ tenantId: 7, loading: false }),
})

export const noSearch = () => ({ GlobalSearch: () => null })
export const nothing = () => () => null

/** Two owner links, deliberately out of order. */
export const ownerItems = [
  { id: 1, name: 'Contact us', routePath: '/contact', position: 2 },
  { id: 2, name: 'Our story', routePath: '/about', position: 1 },
]

/** An api.get that serves a `main` menu group holding `items`. */
export const menuApi = (get: jest.Mock, items: object[]) =>
  get.mockImplementation((u: string) =>
    Promise.resolve({
      data: u.includes('/items')
        ? items
        : u.includes('menu-groups')
          ? [{ id: 1, name: 'main' }]
          : [],
    }),
  )
