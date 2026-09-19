import { renderHook, act, waitFor } from '@testing-library/react'
import { useSuperAdminUsers } from '@/hooks/useSuperAdminUsers'
import { useAdminSettings } from '@/hooks/useAdminSettings'
import { useFileManager } from '@/hooks/useFileManager'
import { m } from '../helpers/scopeApi'

jest.mock('@/lib/api', () => jest.requireActual('../helpers/apiMock').apiMock)
const boom = { response: { data: { error: 'boom' } } }
beforeEach(() => {
  jest.resetAllMocks()
  m.get.mockResolvedValue({ data: [] })
})

it('super admin users surface role and ban failures', async () => {
  m.get.mockResolvedValue({ data: [{ id: 1, username: 'u', role: 1 }] })
  m.put.mockRejectedValue(boom)
  const { result } = renderHook(() => useSuperAdminUsers())
  await waitFor(() => expect(result.current.users).toHaveLength(1))
  act(() => result.current.updateRole(1, 2))
  await waitFor(() => expect(result.current.error).toBe('boom'))
  m.put.mockRejectedValue({ response: { data: {} } })
  act(() => result.current.toggleBan(1))
  await waitFor(() =>
    expect(result.current.error).toBe('Could not update user status'),
  )
})

it('settings surface save and delete failures', async () => {
  m.get.mockResolvedValue({ data: [{ id: 1, name: 'k', value: 'v' }] })
  m.put.mockRejectedValue(boom)
  m.delete.mockRejectedValue(boom)
  const { result } = renderHook(() => useAdminSettings(1))
  await waitFor(() => expect(result.current.settings).toHaveLength(1))
  act(() => result.current.handleSaveEdit(1))
  await waitFor(() => expect(result.current.error).toBe('boom'))
  act(() => result.current.handleDelete(1))
  await waitFor(() => expect(result.current.error).toBe('boom'))
})

it('file manager surfaces a delete failure', async () => {
  const f = { id: 1, name: 'a.txt', uuid: 'u' }
  m.get.mockResolvedValue({ data: [f] })
  m.delete.mockRejectedValue(boom)
  const { result } = renderHook(() => useFileManager(1))
  await waitFor(() => expect(result.current.files).toHaveLength(1))
  act(() => result.current.handleDeleteClick(result.current.files[0]!))
  act(() => result.current.handleDeleteConfirm())
  await waitFor(() => expect(result.current.error).toBe('boom'))
})
