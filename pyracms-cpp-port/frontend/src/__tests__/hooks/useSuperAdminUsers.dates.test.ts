import { renderHook, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import { useSuperAdminUsers } from '@/hooks/useSuperAdminUsers'
import api from '@/lib/api'
import { asMockApi } from '../helpers/mockApi'

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
  it('defaults createdAt to empty string when absent', async () => {
    const raw = [{ id: 22, username: 'x', email: 'x@x.com', isAdmin: false }]
    mockApi.get.mockResolvedValueOnce({ data: raw })
    const { result } = renderHook(() => useSuperAdminUsers())

    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(result.current.users[0]!.createdAt).toBe('')
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

    expect(result.current.users[0]!.createdAt).toBe('2025-07-04')
  })
})
