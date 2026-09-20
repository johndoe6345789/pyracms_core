export const st = {
  push: jest.fn(),
  notFound: false,
  search: new URLSearchParams('tenant=demo'),
}

export const navMock = () => ({
  useRouter: () => ({ push: st.push }),
  useParams: () => ({ slug: 'demo', name: 'g' }),
  usePathname: () => '/site/demo',
  useSearchParams: () => st.search,
})
export const apiMock = () => ({
  __esModule: true,
  default: {
    get: jest.fn(() => Promise.resolve({ data: [] })),
    put: jest.fn(),
    post: jest.fn(),
  },
})
export const libMock = () => ({
  __esModule: true,
  default: (p: { slug: string; initialName?: string }) => (
    <div data-testid="lib">
      {p.slug}:{p.initialName ?? '-'}
    </div>
  ),
})
export const crumbsMock = () => ({
  __esModule: true,
  default: () => <div data-testid="crumbs" />,
})
export const tenantMock = () => ({
  titleFromSlug: (s: string) => s,
  useTenant: () => ({
    tenant: { displayName: 'Demo', description: '', ownerId: 1 },
    notFound: st.notFound,
  }),
})
