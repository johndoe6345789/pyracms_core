import { renderHook, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import { useSuperAdminTenants } from '@/hooks/useSuperAdminTenants'
import api from '@/lib/api'
import { asMockApi } from '../helpers/mockApi'

jest.mock('@/lib/api', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    delete: jest.fn(),
    post: jest.fn(),
  },
}))

const mockApi = asMockApi<'get' | 'delete' | 'post'>(api)

beforeEach(() => {
  jest.clearAllMocks()
})

describe('useSuperAdminTenants — mapping', () => {
  it('sets createdAt to empty string when field is absent', async () => {
    const raw = [{ id: 5, slug: 'foxtrot' }]
    mockApi.get.mockResolvedValueOnce({ data: raw })
    const { result } = renderHook(() => useSuperAdminTenants())

    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(result.current.tenants[0]!.createdAt).toBe('')
  })

  it('truncates ISO timestamp to date portion', async () => {
    const raw = [
      {
        id: 6,
        slug: 'golf',
        createdAt: '2025-06-01T12:00:00Z',
      },
    ]
    mockApi.get.mockResolvedValueOnce({ data: raw })
    const { result } = renderHook(() => useSuperAdminTenants())

    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(result.current.tenants[0]!.createdAt).toBe('2025-06-01')
  })
})
