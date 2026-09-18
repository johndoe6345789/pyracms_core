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

describe('useSuperAdminTenants — initial loading', () => {
  it('starts with loading=true and resolves to false', async () => {
    mockApi.get.mockResolvedValueOnce({ data: RAW_TENANTS })
    const { result } = renderHook(() => useSuperAdminTenants())

    expect(result.current.loading).toBe(true)

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })
  })
})

describe('useSuperAdminTenants — mapping', () => {
  it('maps all tenant row fields', async () => {
    mockApi.get.mockResolvedValueOnce({ data: RAW_TENANTS })
    const { result } = renderHook(() => useSuperAdminTenants())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.tenants).toEqual(MAPPED_TENANTS)
  })

  it('uses slug as name when displayName is absent', async () => {
    const raw = [{ id: 3, slug: 'delta', isActive: true }]
    mockApi.get.mockResolvedValueOnce({ data: raw })
    const { result } = renderHook(() => useSuperAdminTenants())

    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(result.current.tenants[0]!.name).toBe('delta')
  })

  it('defaults isActive to true when field is missing', async () => {
    const raw = [{ id: 4, slug: 'echo' }]
    mockApi.get.mockResolvedValueOnce({ data: raw })
    const { result } = renderHook(() => useSuperAdminTenants())

    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(result.current.tenants[0]!.isActive).toBe(true)
  })

  it('sets createdAt to empty string when field is absent', async () => {
    const raw = [{ id: 5, slug: 'foxtrot' }]
    mockApi.get.mockResolvedValueOnce({ data: raw })
    const { result } = renderHook(() => useSuperAdminTenants())

    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(result.current.tenants[0]!.createdAt).toBe('')
  })
})
