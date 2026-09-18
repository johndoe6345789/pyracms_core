import '@testing-library/jest-dom'

jest.mock('@/lib/api', () => ({
  __esModule: true,
  default: { get: jest.fn(), put: jest.fn() },
}))

beforeEach(() => {
  jest.clearAllMocks()
})

describe('useSuperAdminUsers — role mapping from numeric field', () => {
  it('maps role=4 to SuperAdmin', async () => {
    const raw = [{
      id: 12,
      username: 'super',
      email: 's@x.com',
      role: 4,
      isActive: true,
    }]
    mockApi.get.mockResolvedValueOnce({ data: raw })
    const { result } = renderHook(() => useSuperAdminUsers())

    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(result.current.users[0]!.role).toBe(UserRole.SuperAdmin)
    expect(result.current.users[0]!.roleLabel).toBe('Super Admin')
  })
})

describe('useSuperAdminUsers — legacy isAdmin fallback', () => {
  it('maps isAdmin=true to SiteAdmin when role is undefined', async () => {
    const raw = [{
      id: 20,
      username: 'admin',
      email: 'a@x.com',
      isAdmin: true,
      isActive: true,
    }]
    mockApi.get.mockResolvedValueOnce({ data: raw })
    const { result } = renderHook(() => useSuperAdminUsers())

    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(result.current.users[0]!.role).toBe(UserRole.SiteAdmin)
    expect(result.current.users[0]!.roleLabel).toBe('Site Admin')
  })

  it('maps isAdmin=false to User when role is undefined', async () => {
    const raw = [{
      id: 21,
      username: 'plain',
      email: 'p@x.com',
      isAdmin: false,
      isActive: true,
    }]
    mockApi.get.mockResolvedValueOnce({ data: raw })
    const { result } = renderHook(() => useSuperAdminUsers())

    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(result.current.users[0]!.role).toBe(UserRole.User)
    expect(result.current.users[0]!.roleLabel).toBe('User')
  })

  it('defaults createdAt to empty string when absent', async () => {
    const raw = [{ id: 22, username: 'x', email: 'x@x.com', isAdmin: false }]
    mockApi.get.mockResolvedValueOnce({ data: raw })
    const { result } = renderHook(() => useSuperAdminUsers())

    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(result.current.users[0]!.createdAt).toBe('')
  })
})
