import '@testing-library/jest-dom'

jest.mock('@/lib/api', () => ({
  __esModule: true,
  default: { get: jest.fn(), put: jest.fn() },
}))

beforeEach(() => {
  jest.clearAllMocks()
})

describe('useSuperAdminUsers — toggleBan', () => {
  it('unbans an inactive user: sets isActive=true', async () => {
    mockApi.get.mockResolvedValueOnce({ data: RAW_USERS })
    mockApi.put.mockResolvedValueOnce({ data: {} })
    const { result } = renderHook(() => useSuperAdminUsers())

    await waitFor(() => expect(result.current.loading).toBe(false))
    // user id=2 starts with isActive=false
    expect(result.current.users[1]!.isActive).toBe(false)

    await act(async () => { result.current.toggleBan(2) })

    await waitFor(() => {
      expect(result.current.users[1]!.isActive).toBe(true)
    })

    expect(mockApi.put).toHaveBeenCalledWith(
      '/api/users/2',
      { isActive: true },
    )
  })

  it('does not call PUT for an unknown id', async () => {
    mockApi.get.mockResolvedValueOnce({ data: RAW_USERS })
    const { result } = renderHook(() => useSuperAdminUsers())

    await waitFor(() => expect(result.current.loading).toBe(false))

    act(() => { result.current.toggleBan(9999) })

    expect(mockApi.put).not.toHaveBeenCalled()
  })

  it('keeps optimistic update when PUT fails', async () => {
    mockApi.get.mockResolvedValueOnce({ data: RAW_USERS })
    mockApi.put.mockRejectedValueOnce(new Error('Server error'))
    const { result } = renderHook(() => useSuperAdminUsers())

    await waitFor(() => expect(result.current.loading).toBe(false))

    await act(async () => { result.current.toggleBan(1) })

    // Give microtasks time to settle
    await act(async () => {})

    // Optimistic update is not rolled back on failure (admin UI trade-off)
    expect(result.current.users[0]!.isActive).toBe(false)
  })

  it('does not affect other users when toggling one', async () => {
    mockApi.get.mockResolvedValueOnce({ data: RAW_USERS })
    mockApi.put.mockResolvedValueOnce({ data: {} })
    const { result } = renderHook(() => useSuperAdminUsers())

    await waitFor(() => expect(result.current.loading).toBe(false))

    await act(async () => { result.current.toggleBan(1) })

    await waitFor(() => {
      expect(result.current.users[0]!.isActive).toBe(false)
    })

    // bob's isActive must not have changed
    expect(result.current.users[1]!.isActive).toBe(false)
  })
})
