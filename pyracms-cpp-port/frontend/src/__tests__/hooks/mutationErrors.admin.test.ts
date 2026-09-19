import { renderHook, act, waitFor } from '@testing-library/react'
import { useMenuItemEdit } from '@/hooks/admin/useMenuItemEdit'
import { useMenuAddItem } from '@/hooks/admin/useMenuAddItem'
import { useMenuGroupCreate } from '@/hooks/admin/useMenuGroupCreate'
import { useSettingAdd } from '@/hooks/admin/useSettingAdd'
import { useFileUpload } from '@/hooks/admin/useFileUpload'
import { m } from '../helpers/scopeApi'

jest.mock('@/lib/api', () => require('../helpers/apiMock').apiMock)
const boom = { response: { data: { error: 'boom' } } }
const set = jest.fn()
const item = {
  id: 1,
  name: 'a',
  route: '/a',
  position: 0,
  permissions: 'public',
}
const group = { id: 2, name: 'g', items: [item] }
beforeEach(() => {
  jest.resetAllMocks()
  set.mockReset()
})

it('menu item edit surfaces save and delete failures', async () => {
  m.put.mockRejectedValue(boom)
  m.delete.mockRejectedValue(boom)
  const { result } = renderHook(() => useMenuItemEdit('g', set))
  act(() => result.current.handleStartEdit(item))
  act(() => result.current.handleSaveEdit())
  await waitFor(() => expect(result.current.editError).toBe('boom'))
  m.delete.mockRejectedValue({})
  act(() => result.current.handleDelete(1))
  await waitFor(() =>
    expect(result.current.editError).toBe('Unable to connect to server'),
  )
  m.put.mockResolvedValue({})
  act(() => result.current.handleSaveEdit())
  await waitFor(() => expect(result.current.editError).toBe(''))
})

it('menu add item surfaces a failure', async () => {
  m.post.mockRejectedValue(boom)
  const { result } = renderHook(() => useMenuAddItem(group, 'g', set))
  act(() => {
    result.current.setNewName('n')
    result.current.setNewRoute('/')
  })
  act(() => result.current.handleAddItem())
  await waitFor(() => expect(result.current.addError).toBe('boom'))
})

it('menu group create surfaces a failure', async () => {
  m.post.mockRejectedValue(boom)
  const { result } = renderHook(() => useMenuGroupCreate(1, [], set, jest.fn()))
  act(() => result.current.setNewGroupName('New'))
  act(() => result.current.handleCreateGroup())
  await waitFor(() => expect(result.current.groupError).toBe('boom'))
})

it('setting add surfaces a failure', async () => {
  m.put.mockRejectedValue(boom)
  const { result } = renderHook(() => useSettingAdd(1, [], set))
  act(() => {
    result.current.setNewKey('k')
    result.current.setNewValue('v')
  })
  act(() => result.current.handleAdd())
  await waitFor(() => expect(result.current.addError).toBe('boom'))
})

it('file upload surfaces a failure and clears on retry', async () => {
  m.post.mockRejectedValueOnce(boom).mockResolvedValue({ data: {} })
  const { result } = renderHook(() => useFileUpload(1, set))
  const f = new File(['x'], 'a.txt')
  act(() => result.current.uploadFiles([f] as unknown as FileList))
  await waitFor(() => expect(result.current.uploadError).toBe('boom'))
  act(() => result.current.uploadFiles([f] as unknown as FileList))
  await waitFor(() => expect(result.current.uploadError).toBe(''))
})
