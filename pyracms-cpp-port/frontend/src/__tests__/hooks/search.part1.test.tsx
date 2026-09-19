import { fetchSearch } from '@/hooks/searchTypes'
import api from '@/lib/api'

const push = jest.fn()

let qs = 'q=hello&site=demo'

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push }),
  useSearchParams: () => new URLSearchParams(qs),
}))

jest.mock('@/hooks/useTenantId', () => ({
  useTenantId: () => ({ tenantId: 7 }),
}))

jest.mock('@/lib/api', () => ({
  __esModule: true,
  default: { get: jest.fn() },
}))

const get = api.get as jest.Mock

beforeEach(() => {
  get.mockReset()
  push.mockReset()
  qs = 'q=hello&site=demo'
})

describe('fetchSearch', () => {
  it('builds params and defaults missing fields', async () => {
    get.mockResolvedValue({ data: {} })
    const r = await fetchSearch('a b', '3', 'all', 2)
    expect(r).toEqual({ items: [], totalCount: 0, facets: {} })
    expect(get.mock.calls[0][0]).toContain('offset=10')
    expect(get.mock.calls[0][0]).toContain('tenant_id=3')
  })
})
