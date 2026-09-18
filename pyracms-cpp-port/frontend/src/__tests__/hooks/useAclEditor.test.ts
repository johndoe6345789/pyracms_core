import { renderHook, waitFor, act } from '@testing-library/react'
import api from '@/lib/api'
import { useAclEditor } from '@/hooks/useAclEditor'
import { asMockApi } from '../helpers/mockApi'

jest.mock('@/lib/api', () => ({
  __esModule: true,
  default: { get: jest.fn(), put: jest.fn() },
}))
const mock = asMockApi<'get' | 'put'>(api)
const rules = [
  { id: 3, action: 'Allow', principal: 'admin', permission: 'x' },
]

beforeEach(() => {
  mock.get.mockReset()
  mock.put.mockReset().mockResolvedValue({})
})

it('skips loading without tenant and ignores add', () => {
  const { result } = renderHook(() => useAclEditor(null))
  expect(mock.get).not.toHaveBeenCalled()
  act(() => {
    result.current.setNewPrincipal('p')
    result.current.setNewPermission('q')
  })
  act(() => result.current.handleDelete(1))
  expect(mock.put).not.toHaveBeenCalled()
})

it('loads rules and adds and deletes', async () => {
  mock.get.mockResolvedValue({
    data: { value: JSON.stringify(rules) },
  })
  const { result } = renderHook(() => useAclEditor(1))
  await waitFor(() => expect(result.current.loading).toBe(false))
  expect(result.current.rules).toEqual(rules)
  act(() => result.current.handleAdd())
  expect(result.current.rules).toHaveLength(1)
  act(() => {
    result.current.setNewAction('Deny')
    result.current.setNewPrincipal(' bob ')
    result.current.setNewPermission(' edit ')
  })
  act(() => result.current.handleAdd())
  expect(result.current.rules[1]).toEqual({
    id: 4, action: 'Deny', principal: 'bob', permission: 'edit',
  })
  expect(result.current.newAction).toBe('Allow')
  expect(mock.put).toHaveBeenCalledTimes(1)
  act(() => result.current.handleDelete(3))
  expect(result.current.rules).toHaveLength(1)
  expect(mock.put).toHaveBeenCalledTimes(2)
})

it('falls back to empty on bad json or request error', async () => {
  mock.get.mockResolvedValueOnce({ data: { value: '{bad' } })
  const a = renderHook(() => useAclEditor(1))
  await waitFor(() => expect(a.result.current.loading).toBe(false))
  expect(a.result.current.rules).toEqual([])
  mock.get.mockRejectedValueOnce(new Error('x'))
  const b = renderHook(() => useAclEditor(2))
  await waitFor(() => expect(b.result.current.loading).toBe(false))
  expect(b.result.current.rules).toEqual([])
  mock.get.mockResolvedValueOnce({ data: {} })
  const c = renderHook(() => useAclEditor(3))
  await waitFor(() => expect(c.result.current.loading).toBe(false))
  expect(c.result.current.rules).toEqual([])
})
