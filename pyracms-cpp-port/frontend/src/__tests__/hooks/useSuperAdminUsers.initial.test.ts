import '@testing-library/jest-dom'

jest.mock('@/lib/api', () => ({
  __esModule: true,
  default: { get: jest.fn(), put: jest.fn() },
}))

beforeEach(() => {
  jest.clearAllMocks()
})

describe('useSuperAdminUsers — initial loading', () => {
  it('starts with loading=true and resolves to false', async () => {
    mockApi.get.mockResolvedValueOnce({ data: RAW_USERS })
    const { result } = renderHook(() => useSuperAdminUsers())

    expect(result.current.loading).toBe(true)

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })
  })

  it('populates users with fully mapped rows', async () => {
    mockApi.get.mockResolvedValueOnce({ data: RAW_USERS })
    const { result } = renderHook(() => useSuperAdminUsers())

    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(result.current.users).toEqual(MAPPED_USERS)
  })
})

describe('useSuperAdminUsers — role mapping from numeric field', () => {
  it('maps role=0 to Guest', async () => {
    const raw = [{
      id: 10,
      username: 'guest',
      email: 'g@x.com',
      role: 0,
      isActive: true,
    }]
    mockApi.get.mockResolvedValueOnce({ data: raw })
    const { result } = renderHook(() => useSuperAdminUsers())

    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(result.current.users[0]!.role).toBe(UserRole.Guest)
    expect(result.current.users[0]!.roleLabel).toBe('Guest')
  })

  it('maps role=2 to Moderator', async () => {
    const raw = [{
      id: 11,
      username: 'mod',
      email: 'm@x.com',
      role: 2,
      isActive: true,
    }]
    mockApi.get.mockResolvedValueOnce({ data: raw })
    const { result } = renderHook(() => useSuperAdminUsers())

    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(result.current.users[0]!.role).toBe(UserRole.Moderator)
    expect(result.current.users[0]!.roleLabel).toBe('Moderator')
  })
})
