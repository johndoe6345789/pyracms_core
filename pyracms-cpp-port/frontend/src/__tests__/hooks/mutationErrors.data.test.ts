import { renderHook, act, waitFor } from '@testing-library/react'
import { useAclEditor } from '@/hooks/useAclEditor'
import { useFeatureToggles } from '@/hooks/useFeatureToggles'
import { useArticle } from '@/hooks/useArticle'
import { useSuperAdminTenants } from '@/hooks/useSuperAdminTenants'
import { m } from '../helpers/scopeApi'

jest.mock('@/lib/api', () => jest.requireActual('../helpers/apiMock').apiMock)
const boom = { response: { data: { error: 'boom' } } }
beforeEach(() => {
  jest.resetAllMocks()
  m.get.mockResolvedValue({ data: [] })
})

it('acl editor surfaces a save failure', async () => {
  m.get.mockResolvedValue({ data: { value: '[]' } })
  m.put.mockRejectedValue(boom)
  const { result } = renderHook(() => useAclEditor(1))
  await waitFor(() => expect(result.current.loading).toBe(false))
  act(() => {
    result.current.setNewPrincipal('p')
  })
  act(() => {
    result.current.setNewPermission('x')
  })
  act(() => result.current.handleAdd())
  await waitFor(() => expect(result.current.error).toBe('boom'))
})

it('feature toggles surface a save failure', async () => {
  m.put.mockRejectedValue(boom)
  const { result } = renderHook(() => useFeatureToggles(1))
  await waitFor(() => expect(result.current.loading).toBe(false))
  act(() => result.current.handleSave())
  await waitFor(() => expect(result.current.error).toBe('boom'))
  m.put.mockResolvedValue({})
  act(() => result.current.handleSave())
  await waitFor(() => expect(result.current.error).toBe(''))
})

it('article vote surfaces a failure', async () => {
  m.get.mockResolvedValue({ data: { name: 'n' } })
  m.post.mockRejectedValue(boom)
  const { result } = renderHook(() => useArticle('n', 1))
  await waitFor(() => expect(result.current.article).not.toBeNull())
  act(() => result.current.handleVote(true))
  await waitFor(() => expect(result.current.voteError).toBe('boom'))
})

it('super admin tenants surface a delete failure', async () => {
  m.delete.mockRejectedValue(boom)
  const { result } = renderHook(() => useSuperAdminTenants())
  await waitFor(() => expect(result.current.loading).toBe(false))
  act(() => result.current.handleDelete(3))
  act(() => result.current.confirmDelete())
  await waitFor(() => expect(result.current.deleteError).toBe('boom'))
})
