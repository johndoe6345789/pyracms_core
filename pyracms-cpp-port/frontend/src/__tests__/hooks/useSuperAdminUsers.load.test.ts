import { renderHook, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import { useSuperAdminUsers } from '@/hooks/useSuperAdminUsers'
import api from '@/lib/api'
import { asMockApi } from '../helpers/mockApi'
import { RAW_USERS, MAPPED_USERS } from
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

describe('useSuperAdminUsers — fetch error', () => {
  it('sets loading=false and keeps users empty on network error', async () => {
    mockApi.get.mockRejectedValueOnce(new Error('Network error'))
    const { result } = renderHook(() => useSuperAdminUsers())

    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(result.current.users).toEqual([])
  })
})
