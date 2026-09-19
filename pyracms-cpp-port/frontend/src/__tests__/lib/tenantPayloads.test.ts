import { renderHook, act, waitFor } from '@testing-library/react'
import { putSetting, deleteSetting } from '@/hooks/admin/settingsApi'
import { useFeatureToggles } from '@/hooks/useFeatureToggles'
import { useAclEditor } from '@/hooks/useAclEditor'
import { useMenuGroupCreate } from '@/hooks/admin/useMenuGroupCreate'
import { useArticle } from '@/hooks/useArticle'
import { m } from '../helpers/scopeApi'

jest.mock('@/lib/api', () => jest.requireActual('../helpers/apiMock').apiMock)

// The backend reads the tenant from the JSON body on these routes (camel
// case for settings/menus, snake case for article votes), so a query-only
// tenant_id is rejected with 400.
beforeEach(() => {
  jest.resetAllMocks()
  m.get.mockResolvedValue({ data: { value: '[]' } })
  m.put.mockResolvedValue({})
  m.post.mockResolvedValue({ data: { id: 1 } })
  m.delete.mockResolvedValue({})
})

it('setting writes and deletes carry tenantId in the body', async () => {
  await putSetting('k', 'v', 3)
  expect(m.put.mock.calls[0][1]).toMatchObject({ value: 'v', tenantId: 3 })
  await deleteSetting('k', 3)
  expect(m.delete.mock.calls[0][1]).toEqual({ data: { tenantId: 3 } })
})

it('feature toggles send tenantId', async () => {
  const { result } = renderHook(() => useFeatureToggles(4))
  await waitFor(() => expect(result.current.loading).toBe(false))
  act(() => result.current.handleSave())
  expect(m.put.mock.calls[0][1]).toMatchObject({ tenantId: 4 })
})

it('ACL rules send tenantId', async () => {
  const { result } = renderHook(() => useAclEditor(5))
  await waitFor(() => expect(result.current.loading).toBe(false))
  act(() => result.current.setNewPrincipal('p'))
  act(() => result.current.setNewPermission('x'))
  act(() => result.current.handleAdd())
  expect(m.put.mock.calls[0][1]).toMatchObject({ tenantId: 5 })
})

it('menu group create sends tenantId', () => {
  const { result } = renderHook(() =>
    useMenuGroupCreate(6, [], jest.fn(), jest.fn()),
  )
  act(() => result.current.setNewGroupName('Main'))
  act(() => result.current.handleCreateGroup())
  expect(m.post.mock.calls[0][1]).toEqual({ name: 'main', tenantId: 6 })
})

it('article votes send is_like and tenant_id', async () => {
  m.get.mockResolvedValue({ data: { name: 'n' } })
  const { result } = renderHook(() => useArticle('n', 7))
  await waitFor(() => expect(result.current.loading).toBe(false))
  act(() => result.current.handleVote(false))
  expect(m.post.mock.calls[0][1]).toEqual({ is_like: false, tenant_id: 7 })
})
