import { renderHook, waitFor, act } from '@testing-library/react'
import { useSiteSearch } from '@/hooks/useSiteSearch'
import { fetchSearch } from '@/lib/search/api'

const push = jest.fn()
let query = 'q=golf'
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push }),
  useSearchParams: () => new URLSearchParams(query),
}))
let tenant: number | null = 6
jest.mock('@/hooks/useTenantId', () => ({
  useTenantId: () => ({ tenantId: tenant }),
}))
jest.mock('@/lib/search/api')
const fetchMock = fetchSearch as jest.Mock
const page = { items: [], totalCount: 0, facets: {} }

beforeEach(() => {
  jest.resetAllMocks()
  query = 'q=golf'
  tenant = 6
  fetchMock.mockResolvedValue(page)
})

it('searches what the address says and keeps it in the address', async () => {
  query = 'q=golf&type=snippet&page=2'
  const { result } = renderHook(() => useSiteSearch('rog'))
  await waitFor(() => expect(result.current.data).toBe(page))
  expect(fetchMock).toHaveBeenCalledWith('rog', 6, 'golf', 'snippet', 2)
  act(() => result.current.submit(' fishing '))
  expect(push).toHaveBeenLastCalledWith('/site/rog/search?q=fishing')
  act(() => result.current.setType('article'))
  expect(push).toHaveBeenLastCalledWith('/site/rog/search?q=golf&type=article')
  act(() => result.current.setPage(4))
  expect(push).toHaveBeenLastCalledWith(
    '/site/rog/search?q=golf&type=snippet&page=4',
  )
})

it('waits for the site, and does nothing without words', () => {
  tenant = null
  renderHook(() => useSiteSearch('rog'))
  query = ''
  tenant = 6
  const { result } = renderHook(() => useSiteSearch('rog'))
  expect(fetchMock).not.toHaveBeenCalled()
  expect(result.current.data).toBeNull()
})

it('reports a failed search', async () => {
  fetchMock.mockRejectedValue(new Error('down'))
  const { result } = renderHook(() => useSiteSearch('rog'))
  await waitFor(() => expect(result.current.failed).toBe(true))
  expect(result.current.loading).toBe(false)
})
