import { renderHook, act, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import { useSuperAdminTenants } from '@/hooks/useSuperAdminTenants'
import api from '@/lib/api'
import { asMockApi } from '../helpers/mockApi'
import { RAW_TENANTS } from
  '../helpers/superAdminTenantsFixtures'

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

describe('useSuperAdminTenants — createTenant', () => {
  it('posts to /api/tenants and appends the returned row', async () => {
    mockApi.get.mockResolvedValueOnce({ data: RAW_TENANTS })
    const newRaw = {
      id: 99,
      slug: 'new-co',
      displayName: 'New Co',
      ownerUsername: 'carol',
      isActive: true,
      createdAt: '2025-03-01T00:00:00Z',
    }
    mockApi.post.mockResolvedValueOnce({ data: newRaw })
    const { result } = renderHook(() => useSuperAdminTenants())

    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.tenants).toHaveLength(2)

    await act(async () => {
      await result.current.createTenant({
        slug: 'new-co',
        displayName: 'New Co',
        ownerUsername: 'carol',
      })
    })

    expect(mockApi.post).toHaveBeenCalledWith(
      '/api/tenants',
      { slug: 'new-co', displayName: 'New Co', ownerUsername: 'carol' },
    )
    expect(result.current.tenants).toHaveLength(3)
    const added = result.current.tenants[2]!
    expect(added.id).toBe(99)
    expect(added.slug).toBe('new-co')
    expect(added.name).toBe('New Co')
    expect(added.owner).toBe('carol')
    expect(added.createdAt).toBe('2025-03-01')
  })

  it('silently ignores API errors without mutating state', async () => {
    mockApi.get.mockResolvedValueOnce({ data: RAW_TENANTS })
    mockApi.post.mockRejectedValueOnce(new Error('Conflict'))
    const { result } = renderHook(() => useSuperAdminTenants())

    await waitFor(() => expect(result.current.loading).toBe(false))

    await act(async () => {
      await result.current.createTenant({ slug: 'clash' })
    })

    expect(result.current.tenants).toHaveLength(2)
  })
})
