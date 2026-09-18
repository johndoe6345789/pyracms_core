import { renderHook, waitFor, act } from '@testing-library/react'
import api from '@/lib/api'
import { useAdminSettings } from '@/hooks/useAdminSettings'
import { asMockApi } from '../helpers/mockApi'

jest.mock('@/lib/api', () => ({
  __esModule: true,
  default: { get: jest.fn(), put: jest.fn(), delete: jest.fn() },
}))
const mock = asMockApi<'get' | 'put' | 'delete'>(api)
const rows = [{ id: 1, name: 'a', value: '1' }, { id: 2 }]

async function setup() {
  mock.get.mockResolvedValue({ data: rows })
  const h = renderHook(() => useAdminSettings(5))
  await waitFor(() => expect(h.result.current.loading).toBe(false))
  return h
}

beforeEach(() => {
  mock.get.mockReset()
  mock.put.mockReset().mockResolvedValue({ data: {} })
  mock.delete.mockReset().mockResolvedValue({})
})

it('does nothing without a tenant', () => {
  const { result } = renderHook(() => useAdminSettings(null))
  expect(mock.get).not.toHaveBeenCalled()
  act(() => {
    result.current.setNewKey('k')
    result.current.setNewValue('v')
  })
  act(() => result.current.handleAdd())
  expect(mock.put).not.toHaveBeenCalled()
})

it('loads and maps settings with defaults', async () => {
  const { result } = await setup()
  expect(result.current.settings).toEqual([
    { id: 1, key: 'a', value: '1' },
    { id: 2, key: '', value: '' },
  ])
})

it('edits, cancels and saves', async () => {
  const { result } = await setup()
  const first = () => result.current.settings[0]!
  act(() => result.current.handleStartEdit(first()))
  expect(result.current.editValue).toBe('1')
  act(() => result.current.handleCancelEdit())
  expect(result.current.editingId).toBeNull()
  act(() => result.current.handleSaveEdit(99))
  expect(mock.put).not.toHaveBeenCalled()
  act(() => result.current.handleStartEdit(first()))
  act(() => result.current.setEditValue('9'))
  act(() => result.current.handleSaveEdit(1))
  await waitFor(() => expect(result.current.editingId).toBeNull())
  expect(first().value).toBe('9')
  expect(mock.put).toHaveBeenCalledWith(
    '/api/settings/a?tenant_id=5', { name: 'a', value: '9' },
  )
})

it('deletes and adds', async () => {
  const { result } = await setup()
  act(() => result.current.handleDelete(99))
  expect(mock.delete).not.toHaveBeenCalled()
  act(() => result.current.handleDelete(2))
  await waitFor(() => expect(result.current.settings).toHaveLength(1))
  act(() => result.current.handleAdd())
  expect(mock.put).not.toHaveBeenCalled()
  act(() => {
    result.current.setNewKey('k')
    result.current.setNewValue('v')
  })
  act(() => result.current.handleAdd())
  await waitFor(() => expect(result.current.newKey).toBe(''))
  expect(result.current.settings[1]).toEqual(
    { id: 2, key: 'k', value: 'v' },
  )
})

it('swallows request errors', async () => {
  mock.get.mockRejectedValue(new Error('x'))
  const { result } = renderHook(() => useAdminSettings(5))
  await waitFor(() => expect(result.current.loading).toBe(false))
  expect(result.current.settings).toEqual([])
})
