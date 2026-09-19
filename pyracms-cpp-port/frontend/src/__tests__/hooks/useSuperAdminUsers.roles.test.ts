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
    expect(result.current.users[0]!.roleLabel).toBe('Platform Owner')
  })
})
