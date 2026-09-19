import { renderHook, act, waitFor } from '@testing-library/react'
import { useAclEditor } from '@/hooks/useAclEditor'
import { m } from '../../helpers/scopeApi'

jest.mock(
  '@/lib/api',
  () => jest.requireActual('../../helpers/apiMock').apiMock,
)

const rules = [{ id: 2, action: 'Deny', principal: 'a', permission: 'b' }]

beforeEach(() => {
  jest.resetAllMocks()
  m.put.mockResolvedValue({})
})

it('skips fetch without tenant', () => {
  renderHook(() => useAclEditor(null))
  expect(m.get).not.toHaveBeenCalled()
})

it('loads rules and adds/deletes', async () => {
  m.get.mockResolvedValue({ data: { value: JSON.stringify(rules) } })
  const { result } = renderHook(() => useAclEditor(1))
  await waitFor(() => expect(result.current.loading).toBe(false))
  expect(result.current.rules).toEqual(rules)
  act(() => result.current.handleAdd())
  expect(result.current.rules).toHaveLength(1)
  act(() => {
    result.current.setNewAction('Allow')
    result.current.setNewPrincipal(' p ')
    result.current.setNewPermission(' x ')
  })
  act(() => result.current.handleAdd())
  expect(result.current.rules[1]).toEqual({
    id: 3,
    action: 'Allow',
    principal: 'p',
    permission: 'x',
  })
  expect(m.put).toHaveBeenCalledTimes(1)
  act(() => result.current.handleDelete(2))
  expect(result.current.rules).toHaveLength(1)
})

it('handles bad json and errors', async () => {
  m.get.mockResolvedValue({ data: { value: '{bad' } })
  const a = renderHook(() => useAclEditor(1))
  await waitFor(() => expect(a.result.current.loading).toBe(false))
  expect(a.result.current.rules).toEqual([])
  m.get.mockRejectedValue(new Error('x'))
  const b = renderHook(() => useAclEditor(1))
  await waitFor(() => expect(b.result.current.loading).toBe(false))
  expect(b.result.current.rules).toEqual([])
})
