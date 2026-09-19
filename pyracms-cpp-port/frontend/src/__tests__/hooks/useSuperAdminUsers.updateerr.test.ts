import { renderHook, act, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import { useSuperAdminUsers } from '@/hooks/useSuperAdminUsers'
import { UserRole } from '@/types'
import api from '@/lib/api'
import { asMockApi } from '../helpers/mockApi'
import { RAW_USERS } from '../helpers/superAdminUsersFixtures'

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
    expect(result.current.users[0]!.roleLabel).toBe('Administrator')
  })
})
