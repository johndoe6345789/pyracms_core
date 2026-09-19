import { renderHook, act } from '@testing-library/react'
import { useSearchPage } from '@/hooks/useSearchPage'
import api from '@/lib/api'

const push = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push }),
  useSearchParams: () => new URLSearchParams('q=hello'),
}))
jest.mock('@/hooks/useTenantId', () => ({
  useTenantId: () => ({ tenantId: null }),
}))
jest.mock('@/lib/api', () => ({
  __esModule: true, default: { get: jest.fn() },
}))

it('never guesses a tenant: no site means no request', async () => {
  const { result } = renderHook(() => useSearchPage())
  await act(async () => { result.current.handleSearch('foo') })
  expect(api.get).not.toHaveBeenCalled()
  expect(result.current.tenantId).toBe('')
  expect(result.current.results).toEqual([])
})
