import { renderHook, act, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import { useSuperAdminUsers } from '@/hooks/useSuperAdminUsers'
import { UserRole } from '@/types'
import api from '@/lib/api'
import { asMockApi } from '../helpers/mockApi'
import { RAW_USERS } from
  '../helpers/superAdminUsersFixtures'

jest.mock('@/lib/api', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    put: jest.fn(),
  },
}))

const mockApi = asMockApi<'get' | 'put'>(api)

beforeEach(() => {
  jest.clearAllMocks()
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
    expect(result.current.users[0]!.roleLabel).toBe('Platform Owner')
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
