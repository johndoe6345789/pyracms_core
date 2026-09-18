import '@testing-library/jest-dom'

jest.mock('@/lib/api', () => ({
  __esModule: true,
  default: { get: jest.fn(), put: jest.fn() },
}))

beforeEach(() => {
  jest.clearAllMocks()
})

describe('useSuperAdminUsers — legacy isAdmin fallback', () => {
  it('truncates ISO timestamp to date portion', async () => {
    const raw = [{
      id: 23,
      username: 'y',
      email: 'y@x.com',
      isAdmin: false,
      createdAt: '2025-07-04T00:00:00Z',
    }]
    mockApi.get.mockResolvedValueOnce({ data: raw })
    const { result } = renderHook(() => useSuperAdminUsers())

    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(result.current.users[0]!.createdAt).toBe('2025-07-04')
  })
})

describe('useSuperAdminUsers — updateRole (success)', () => {
  it('calls PUT /api/users/{id} with role payload', async () => {
    mockApi.get.mockResolvedValueOnce({ data: RAW_USERS })
    mockApi.put.mockResolvedValueOnce({ data: {} })
    const { result } = renderHook(() => useSuperAdminUsers())

    await waitFor(() => expect(result.current.loading).toBe(false))

    await act(async () => {
      result.current.updateRole(1, UserRole.SuperAdmin)
    })

    await waitFor(() => {
      expect(result.current.users[0]!.role).toBe(UserRole.SuperAdmin)
    })

    expect(mockApi.put).toHaveBeenCalledWith(
      '/api/users/1',
      { role: UserRole.SuperAdmin },
    )
    expect(result.current.users[0]!.roleLabel).toBe('Super Admin')
  })

  it('does not mutate other users when updating one', async () => {
    mockApi.get.mockResolvedValueOnce({ data: RAW_USERS })
    mockApi.put.mockResolvedValueOnce({ data: {} })
    const { result } = renderHook(() => useSuperAdminUsers())

    await waitFor(() => expect(result.current.loading).toBe(false))

    await act(async () => {
      result.current.updateRole(1, UserRole.SuperAdmin)
    })

    await waitFor(() => {
      expect(result.current.users[0]!.role).toBe(UserRole.SuperAdmin)
    })

    expect(result.current.users[1]!.role).toBe(UserRole.User)
  })
})
