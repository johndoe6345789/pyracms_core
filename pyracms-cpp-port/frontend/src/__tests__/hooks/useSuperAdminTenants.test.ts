import { renderHook, act, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import {
  useSuperAdminTenants,
  TenantRow,
} from '@/hooks/useSuperAdminTenants'
import api from '@/lib/api'

jest.mock('@/lib/api', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    delete: jest.fn(),
    post: jest.fn(),
  },
}))

const mockApi = api as {
  get: jest.MockedFunction<typeof api.get>
  delete: jest.MockedFunction<typeof api.delete>
  post: jest.MockedFunction<typeof api.post>
}

const RAW_TENANTS = [
  {
    id: 1,
    slug: 'acme',
    displayName: 'Acme Corp',
    ownerUsername: 'alice',
    isActive: true,
    createdAt: '2024-01-15T10:00:00Z',
  },
  {
    id: 2,
    slug: 'beta',
    displayName: 'Beta Inc',
    ownerUsername: 'bob',
    isActive: false,
    createdAt: '2024-02-20T09:30:00Z',
  },
]

const MAPPED_TENANTS: TenantRow[] = [
  {
    id: 1,
    slug: 'acme',
    name: 'Acme Corp',
    owner: 'alice',
    isActive: true,
    createdAt: '2024-01-15',
  },
  {
    id: 2,
    slug: 'beta',
    name: 'Beta Inc',
    owner: 'bob',
    isActive: false,
    createdAt: '2024-02-20',
  },
]

beforeEach(() => {
  jest.clearAllMocks()
})

// ---------------------------------------------------------------------------
// 1. Initial loading state, then false after fetch
// ---------------------------------------------------------------------------
describe('useSuperAdminTenants — initial loading', () => {
  it('starts with loading=true and resolves to false', async () => {
    mockApi.get.mockResolvedValueOnce({ data: RAW_TENANTS })
    const { result } = renderHook(() => useSuperAdminTenants())

    expect(result.current.loading).toBe(true)

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })
  })
})

// ---------------------------------------------------------------------------
// 2. Maps API response correctly
// ---------------------------------------------------------------------------
describe('useSuperAdminTenants — mapping', () => {
  it('maps all fields: id, slug, name, owner, isActive, createdAt', async () => {
    mockApi.get.mockResolvedValueOnce({ data: RAW_TENANTS })
    const { result } = renderHook(() => useSuperAdminTenants())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.tenants).toEqual(MAPPED_TENANTS)
  })

  it('uses slug as name when displayName is absent', async () => {
    const raw = [{ id: 3, slug: 'delta', isActive: true }]
    mockApi.get.mockResolvedValueOnce({ data: raw })
    const { result } = renderHook(() => useSuperAdminTenants())

    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(result.current.tenants[0].name).toBe('delta')
  })

  it('defaults isActive to true when field is missing', async () => {
    const raw = [{ id: 4, slug: 'echo' }]
    mockApi.get.mockResolvedValueOnce({ data: raw })
    const { result } = renderHook(() => useSuperAdminTenants())

    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(result.current.tenants[0].isActive).toBe(true)
  })

  it('sets createdAt to empty string when field is absent', async () => {
    const raw = [{ id: 5, slug: 'foxtrot' }]
    mockApi.get.mockResolvedValueOnce({ data: raw })
    const { result } = renderHook(() => useSuperAdminTenants())

    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(result.current.tenants[0].createdAt).toBe('')
  })

  it('truncates ISO timestamp to date portion', async () => {
    const raw = [{
      id: 6,
      slug: 'golf',
      createdAt: '2025-06-01T12:00:00Z',
    }]
    mockApi.get.mockResolvedValueOnce({ data: raw })
    const { result } = renderHook(() => useSuperAdminTenants())

    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(result.current.tenants[0].createdAt).toBe('2025-06-01')
  })
})

// ---------------------------------------------------------------------------
// 3. handleDelete sets confirmDeleteId
// ---------------------------------------------------------------------------
describe('useSuperAdminTenants — handleDelete', () => {
  it('sets confirmDeleteId to the given id', async () => {
    mockApi.get.mockResolvedValueOnce({ data: RAW_TENANTS })
    const { result } = renderHook(() => useSuperAdminTenants())

    await waitFor(() => expect(result.current.loading).toBe(false))

    act(() => { result.current.handleDelete(1) })

    expect(result.current.confirmDeleteId).toBe(1)
  })
})

// ---------------------------------------------------------------------------
// 4. cancelDelete clears confirmDeleteId
// ---------------------------------------------------------------------------
describe('useSuperAdminTenants — cancelDelete', () => {
  it('resets confirmDeleteId to null', async () => {
    mockApi.get.mockResolvedValueOnce({ data: RAW_TENANTS })
    const { result } = renderHook(() => useSuperAdminTenants())

    await waitFor(() => expect(result.current.loading).toBe(false))

    act(() => { result.current.handleDelete(1) })
    expect(result.current.confirmDeleteId).toBe(1)

    act(() => { result.current.cancelDelete() })
    expect(result.current.confirmDeleteId).toBeNull()
  })
})

// ---------------------------------------------------------------------------
// 5. confirmDelete calls DELETE and removes tenant from list
// ---------------------------------------------------------------------------
describe('useSuperAdminTenants — confirmDelete (success)', () => {
  it('calls DELETE /api/tenants/{id} and removes item', async () => {
    mockApi.get.mockResolvedValueOnce({ data: RAW_TENANTS })
    mockApi.delete.mockResolvedValueOnce({ data: {} })
    const { result } = renderHook(() => useSuperAdminTenants())

    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.tenants).toHaveLength(2)

    act(() => { result.current.handleDelete(1) })

    await act(async () => { result.current.confirmDelete() })

    await waitFor(() => {
      expect(result.current.confirmDeleteId).toBeNull()
    })

    expect(mockApi.delete).toHaveBeenCalledWith('/api/tenants/1')
    expect(result.current.tenants).toHaveLength(1)
    expect(result.current.tenants[0].id).toBe(2)
  })
})

// ---------------------------------------------------------------------------
// 6. confirmDelete when confirmDeleteId=null is a no-op
// ---------------------------------------------------------------------------
describe('useSuperAdminTenants — confirmDelete (no-op)', () => {
  it('does nothing when confirmDeleteId is null', async () => {
    mockApi.get.mockResolvedValueOnce({ data: RAW_TENANTS })
    const { result } = renderHook(() => useSuperAdminTenants())

    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.confirmDeleteId).toBeNull()

    act(() => { result.current.confirmDelete() })

    expect(mockApi.delete).not.toHaveBeenCalled()
    expect(result.current.tenants).toHaveLength(2)
  })
})

// ---------------------------------------------------------------------------
// 7. API fetch error: loading becomes false, tenants stays empty
// ---------------------------------------------------------------------------
describe('useSuperAdminTenants — fetch error', () => {
  it('sets loading=false and keeps tenants empty on error', async () => {
    mockApi.get.mockRejectedValueOnce(new Error('Network error'))
    const { result } = renderHook(() => useSuperAdminTenants())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.tenants).toEqual([])
  })
})

// ---------------------------------------------------------------------------
// 8. Handles missing / null fields gracefully
// ---------------------------------------------------------------------------
describe('useSuperAdminTenants — null/missing fields', () => {
  it('handles null values without throwing', async () => {
    const raw = [{
      id: null,
      slug: null,
      displayName: null,
      ownerUsername: null,
      isActive: null,
      createdAt: null,
    }]
    mockApi.get.mockResolvedValueOnce({ data: raw })
    const { result } = renderHook(() => useSuperAdminTenants())

    await waitFor(() => expect(result.current.loading).toBe(false))

    const t = result.current.tenants[0]
    expect(t.id).toBe(0)
    expect(t.slug).toBe('')
    expect(t.name).toBe('')
    expect(t.owner).toBe('')
    expect(t.isActive).toBe(true)
    expect(t.createdAt).toBe('')
  })

  it('treats empty response data array as empty list', async () => {
    mockApi.get.mockResolvedValueOnce({ data: [] })
    const { result } = renderHook(() => useSuperAdminTenants())

    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(result.current.tenants).toEqual([])
  })

  it('treats null response data as empty list', async () => {
    mockApi.get.mockResolvedValueOnce({ data: null })
    const { result } = renderHook(() => useSuperAdminTenants())

    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(result.current.tenants).toEqual([])
  })
})

// ---------------------------------------------------------------------------
// 9. createTenant — adds new row to list
// ---------------------------------------------------------------------------
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
    const added = result.current.tenants[2]
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
