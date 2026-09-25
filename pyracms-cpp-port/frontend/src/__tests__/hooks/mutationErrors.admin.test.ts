import { renderHook, act, waitFor } from '@testing-library/react'
import { useMenuGroupCreate } from '@/hooks/admin/useMenuGroupCreate'
import { useSettingAdd } from '@/hooks/admin/useSettingAdd'
import { useFileUpload } from '@/hooks/admin/useFileUpload'
import { m } from '../helpers/scopeApi'

jest.mock('@/lib/api', () => jest.requireActual('../helpers/apiMock').apiMock)
const boom = { response: { data: { error: 'boom' } } }
const set = jest.fn()
beforeEach(() => {
  jest.resetAllMocks()
  set.mockReset()
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
