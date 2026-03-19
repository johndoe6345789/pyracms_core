import { renderHook, act, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import {
  useSuperAdminUsers,
  GlobalUserRow,
} from '@/hooks/useSuperAdminUsers'
import { UserRole } from '@/types'
import api from '@/lib/api'

jest.mock('@/lib/api', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    put: jest.fn(),
  },
}))

const mockApi = api as {
  get: jest.MockedFunction<typeof api.get>
  put: jest.MockedFunction<typeof api.put>
}

const RAW_USERS = [
  {
    id: 1,
    username: 'alice',
    email: 'alice@example.com',
    role: UserRole.SiteAdmin,
    isActive: true,
    createdAt: '2024-01-10T08:00:00Z',
  },
  {
    id: 2,
    username: 'bob',
    email: 'bob@example.com',
    role: UserRole.User,
    isActive: false,
    createdAt: '2024-03-05T12:00:00Z',
  },
]

const MAPPED_USERS: GlobalUserRow[] = [
  {
    id: 1,
    username: 'alice',
    email: 'alice@example.com',
    role: UserRole.SiteAdmin,
    roleLabel: 'Site Admin',
    isActive: true,
    createdAt: '2024-01-10',
  },
  {
    id: 2,
    username: 'bob',
    email: 'bob@example.com',
    role: UserRole.User,
    roleLabel: 'User',
    isActive: false,
    createdAt: '2024-03-05',
  },
]

beforeEach(() => {
  jest.clearAllMocks()
})

// ---------------------------------------------------------------------------
// 1. Initial loading, then mapped list
// ---------------------------------------------------------------------------
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

// ---------------------------------------------------------------------------
// 2. Maps role from numeric role field
// ---------------------------------------------------------------------------
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

    expect(result.current.users[0].role).toBe(UserRole.Guest)
    expect(result.current.users[0].roleLabel).toBe('Guest')
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

    expect(result.current.users[0].role).toBe(UserRole.Moderator)
    expect(result.current.users[0].roleLabel).toBe('Moderator')
  })

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

    expect(result.current.users[0].role).toBe(UserRole.SuperAdmin)
    expect(result.current.users[0].roleLabel).toBe('Super Admin')
  })
})

// ---------------------------------------------------------------------------
// 3. Falls back to isAdmin boolean when role field absent
// ---------------------------------------------------------------------------
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

    expect(result.current.users[0].role).toBe(UserRole.SiteAdmin)
    expect(result.current.users[0].roleLabel).toBe('Site Admin')
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

    expect(result.current.users[0].role).toBe(UserRole.User)
    expect(result.current.users[0].roleLabel).toBe('User')
  })

  it('defaults createdAt to empty string when absent', async () => {
    const raw = [{ id: 22, username: 'x', email: 'x@x.com', isAdmin: false }]
    mockApi.get.mockResolvedValueOnce({ data: raw })
    const { result } = renderHook(() => useSuperAdminUsers())

    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(result.current.users[0].createdAt).toBe('')
  })

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

    expect(result.current.users[0].createdAt).toBe('2025-07-04')
  })
})

// ---------------------------------------------------------------------------
// 4. updateRole calls PUT and updates local state
// ---------------------------------------------------------------------------
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
      expect(result.current.users[0].role).toBe(UserRole.SuperAdmin)
    })

    expect(mockApi.put).toHaveBeenCalledWith(
      '/api/users/1',
      { role: UserRole.SuperAdmin },
    )
    expect(result.current.users[0].roleLabel).toBe('Super Admin')
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
      expect(result.current.users[0].role).toBe(UserRole.SuperAdmin)
    })

    expect(result.current.users[1].role).toBe(UserRole.User)
  })
})

// ---------------------------------------------------------------------------
// 5. API error on updateRole: state unchanged
// ---------------------------------------------------------------------------
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

    expect(result.current.users[0].role).toBe(UserRole.SiteAdmin)
    expect(result.current.users[0].roleLabel).toBe('Site Admin')
  })
})

// ---------------------------------------------------------------------------
// 6. API fetch error: loading false, users empty
// ---------------------------------------------------------------------------
describe('useSuperAdminUsers — fetch error', () => {
  it('sets loading=false and keeps users empty on network error', async () => {
    mockApi.get.mockRejectedValueOnce(new Error('Network error'))
    const { result } = renderHook(() => useSuperAdminUsers())

    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(result.current.users).toEqual([])
  })
})

// ---------------------------------------------------------------------------
// 7. toggleBan — flips isActive and calls PUT
// ---------------------------------------------------------------------------
describe('useSuperAdminUsers — toggleBan', () => {
  it('bans an active user: sets isActive=false', async () => {
    mockApi.get.mockResolvedValueOnce({ data: RAW_USERS })
    mockApi.put.mockResolvedValueOnce({ data: {} })
    const { result } = renderHook(() => useSuperAdminUsers())

    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.users[0].isActive).toBe(true)

    await act(async () => { result.current.toggleBan(1) })

    await waitFor(() => {
      expect(result.current.users[0].isActive).toBe(false)
    })

    expect(mockApi.put).toHaveBeenCalledWith(
      '/api/users/1',
      { isActive: false },
    )
  })

  it('unbans an inactive user: sets isActive=true', async () => {
    mockApi.get.mockResolvedValueOnce({ data: RAW_USERS })
    mockApi.put.mockResolvedValueOnce({ data: {} })
    const { result } = renderHook(() => useSuperAdminUsers())

    await waitFor(() => expect(result.current.loading).toBe(false))
    // user id=2 starts with isActive=false
    expect(result.current.users[1].isActive).toBe(false)

    await act(async () => { result.current.toggleBan(2) })

    await waitFor(() => {
      expect(result.current.users[1].isActive).toBe(true)
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

  it('leaves state unchanged when PUT fails', async () => {
    mockApi.get.mockResolvedValueOnce({ data: RAW_USERS })
    mockApi.put.mockRejectedValueOnce(new Error('Server error'))
    const { result } = renderHook(() => useSuperAdminUsers())

    await waitFor(() => expect(result.current.loading).toBe(false))

    await act(async () => { result.current.toggleBan(1) })

    // Give microtasks time to settle
    await act(async () => {})

    expect(result.current.users[0].isActive).toBe(true)
  })

  it('does not affect other users when toggling one', async () => {
    mockApi.get.mockResolvedValueOnce({ data: RAW_USERS })
    mockApi.put.mockResolvedValueOnce({ data: {} })
    const { result } = renderHook(() => useSuperAdminUsers())

    await waitFor(() => expect(result.current.loading).toBe(false))

    await act(async () => { result.current.toggleBan(1) })

    await waitFor(() => {
      expect(result.current.users[0].isActive).toBe(false)
    })

    // bob's isActive must not have changed
    expect(result.current.users[1].isActive).toBe(false)
  })
})
