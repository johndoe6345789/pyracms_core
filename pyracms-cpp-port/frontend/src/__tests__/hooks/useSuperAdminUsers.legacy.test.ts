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
    expect(result.current.users[0]!.roleLabel).toBe('Administrator')
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
    expect(result.current.users[0]!.roleLabel).toBe('Normal User')
  })

})
