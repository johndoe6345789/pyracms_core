import '@testing-library/jest-dom'

jest.mock('@/lib/api', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    delete: jest.fn(),
    post: jest.fn(),
  },
}))

beforeEach(() => {
  jest.clearAllMocks()
})

describe('useSuperAdminTenants — null/missing fields', () => {
  it('handles null values without throwing', async () => {
    const raw = [{
      id: null,
      slug: null,
      displayName: null,
      ownerUsername: null,
      isActive: null,
      createdAt: null,
    }]
    mockApi.get.mockResolvedValueOnce({ data: raw })
    const { result } = renderHook(() => useSuperAdminTenants())

    await waitFor(() => expect(result.current.loading).toBe(false))

    const t = result.current.tenants[0]!
    expect(t.id).toBe(0)
    expect(t.slug).toBe('')
    expect(t.name).toBe('')
    expect(t.owner).toBe('')
    expect(t.isActive).toBe(true)
    expect(t.createdAt).toBe('')
  })

  it('treats empty response data array as empty list', async () => {
    mockApi.get.mockResolvedValueOnce({ data: [] })
    const { result } = renderHook(() => useSuperAdminTenants())

    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(result.current.tenants).toEqual([])
  })

  it('treats null response data as empty list', async () => {
    mockApi.get.mockResolvedValueOnce({ data: null })
    const { result } = renderHook(() => useSuperAdminTenants())

    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(result.current.tenants).toEqual([])
  })
})
