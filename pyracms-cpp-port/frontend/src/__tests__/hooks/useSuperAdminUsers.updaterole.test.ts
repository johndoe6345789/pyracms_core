import '@testing-library/jest-dom'

jest.mock('@/lib/api', () => ({
  __esModule: true,
  default: { get: jest.fn(), put: jest.fn() },
}))

beforeEach(() => {
  jest.clearAllMocks()
})

describe('useSuperAdminUsers — updateRole (error)', () => {
  it('leaves users unchanged when PUT fails', async () => {
    mockApi.get.mockResolvedValueOnce({ data: RAW_USERS })
    mockApi.put.mockRejectedValueOnce(new Error('Forbidden'))
    const { result } = renderHook(() => useSuperAdminUsers())

    await waitFor(() => expect(result.current.loading).toBe(false))

    await act(async () => {
      result.current.updateRole(1, UserRole.SuperAdmin)
    })

    // Give any pending microtasks time to settle
    await act(async () => {})

    expect(result.current.users[0]!.role).toBe(UserRole.SiteAdmin)
    expect(result.current.users[0]!.roleLabel).toBe('Site Admin')
  })
})

describe('useSuperAdminUsers — fetch error', () => {
  it('sets loading=false and keeps users empty on network error', async () => {
    mockApi.get.mockRejectedValueOnce(new Error('Network error'))
    const { result } = renderHook(() => useSuperAdminUsers())

    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(result.current.users).toEqual([])
  })
})

describe('useSuperAdminUsers — toggleBan', () => {
  it('bans an active user: sets isActive=false', async () => {
    mockApi.get.mockResolvedValueOnce({ data: RAW_USERS })
    mockApi.put.mockResolvedValueOnce({ data: {} })
    const { result } = renderHook(() => useSuperAdminUsers())

    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.users[0]!.isActive).toBe(true)

    await act(async () => { result.current.toggleBan(1) })

    await waitFor(() => {
      expect(result.current.users[0]!.isActive).toBe(false)
    })

    expect(mockApi.put).toHaveBeenCalledWith(
      '/api/users/1',
      { isActive: false },
    )
  })
})
