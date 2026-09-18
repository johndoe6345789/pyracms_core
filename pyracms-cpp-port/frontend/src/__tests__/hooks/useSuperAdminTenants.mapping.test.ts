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

describe('useSuperAdminTenants — mapping', () => {
  it('truncates ISO timestamp to date portion', async () => {
    const raw = [{
      id: 6,
      slug: 'golf',
      createdAt: '2025-06-01T12:00:00Z',
    }]
    mockApi.get.mockResolvedValueOnce({ data: raw })
    const { result } = renderHook(() => useSuperAdminTenants())

    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(result.current.tenants[0]!.createdAt).toBe('2025-06-01')
  })
})

describe('useSuperAdminTenants — handleDelete', () => {
  it('sets confirmDeleteId to the given id', async () => {
    mockApi.get.mockResolvedValueOnce({ data: RAW_TENANTS })
    const { result } = renderHook(() => useSuperAdminTenants())

    await waitFor(() => expect(result.current.loading).toBe(false))

    act(() => { result.current.handleDelete(1) })

    expect(result.current.confirmDeleteId).toBe(1)
  })
})

describe('useSuperAdminTenants — cancelDelete', () => {
  it('resets confirmDeleteId to null', async () => {
    mockApi.get.mockResolvedValueOnce({ data: RAW_TENANTS })
    const { result } = renderHook(() => useSuperAdminTenants())

    await waitFor(() => expect(result.current.loading).toBe(false))

    act(() => { result.current.handleDelete(1) })
    expect(result.current.confirmDeleteId).toBe(1)

    act(() => { result.current.cancelDelete() })
    expect(result.current.confirmDeleteId).toBeNull()
  })
})
