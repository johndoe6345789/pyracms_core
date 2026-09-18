import { renderHook, act, waitFor } from '@testing-library/react'
import { useAdminSettings } from '@/hooks/useAdminSettings'
import { m } from '../../helpers/scopeApi'

jest.mock('@/lib/api', () => require('../../helpers/apiMock').apiMock)

const raw = [{ id: 1, name: 'k', value: 'v' }, { id: 2 }]

beforeEach(() => {
  jest.resetAllMocks()
  m.get.mockResolvedValue({ data: raw })
  m.put.mockResolvedValue({ data: { id: 9 } })
  m.delete.mockResolvedValue({})
})

const setup = async () => {
  const h = renderHook(() => useAdminSettings(1))
  await waitFor(() => expect(h.result.current.loading).toBe(false))
  return h
}

it('loads, edits, cancels, deletes', async () => {
  const { result } = await setup()
  expect(result.current.settings[1]).toEqual({ id: 2, key: '', value: '' })
  act(() => result.current.handleStartEdit(result.current.settings[0]!))
  expect(result.current.editValue).toBe('v')
  act(() => result.current.setEditValue('n'))
  act(() => result.current.handleSaveEdit(1))
  await waitFor(() => expect(result.current.settings[0]!.value).toBe('n'))
  expect(result.current.editingId).toBeNull()
  act(() => result.current.handleStartEdit(result.current.settings[0]!))
  act(() => result.current.handleCancelEdit())
  expect(result.current.editValue).toBe('')
  act(() => result.current.handleSaveEdit(99))
  act(() => result.current.handleDelete(99))
  act(() => result.current.handleDelete(1))
  await waitFor(() => expect(result.current.settings).toHaveLength(1))
})

it('adds a setting with id fallback', async () => {
  const { result } = await setup()
  act(() => result.current.handleAdd())
  act(() => {
    result.current.setNewKey('a')
    result.current.setNewValue('b')
  })
  act(() => result.current.handleAdd())
  await waitFor(() => expect(result.current.settings).toHaveLength(3))
  expect(result.current.settings[2]!.id).toBe(9)
  m.put.mockResolvedValue({})
  act(() => {
    result.current.setNewKey('c')
    result.current.setNewValue('d')
  })
  act(() => result.current.handleAdd())
  await waitFor(() => expect(result.current.settings[3]!.id).toBe(10))
})

it('tolerates api errors and null tenant', async () => {
  m.get.mockRejectedValue(new Error('x'))
  m.put.mockRejectedValue(new Error('x'))
  const { result } = await setup()
  act(() => {
    result.current.setNewKey('a')
    result.current.setNewValue('b')
  })
  act(() => result.current.handleAdd())
  expect(result.current.settings).toEqual([])
  renderHook(() => useAdminSettings(null))
})
