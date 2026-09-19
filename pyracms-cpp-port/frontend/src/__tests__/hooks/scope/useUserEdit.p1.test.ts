import { renderHook, act, waitFor } from '@testing-library/react'
import { useAdminUsers } from '@/hooks/useAdminUsers'
import { m } from '../../helpers/scopeApi'

jest.mock('@/lib/api', () => require('../../helpers/apiMock').apiMock)

const setup = async () => {
  const h = renderHook(() => useAdminUsers())
  await waitFor(() => expect(h.result.current.loading).toBe(false))
  return h
}

beforeEach(() => {
  jest.resetAllMocks()
  m.get.mockResolvedValue({
    data: [{ id: 1, username: 'u', fullName: 'Old', email: 'o@x', role: 1 }],
  })
  m.put.mockResolvedValue({})
})

it('maps full names and opens/closes the editor', async () => {
  const { result } = await setup()
  expect(result.current.users[0]!.fullName).toBe('Old')
  act(() => result.current.handleEditClick(result.current.users[0]!))
  expect(result.current.editUser?.id).toBe(1)
  act(() => result.current.handleEditClose())
  expect(result.current.editUser).toBeNull()
})

it('saves profile fields and updates the row', async () => {
  const { result } = await setup()
  act(() => result.current.handleEditClick(result.current.users[0]!))
  act(() =>
    result.current.handleEditSave({ fullName: 'New', email: 'n@x', role: 1 }),
  )
  await waitFor(() => expect(result.current.editUser).toBeNull())
  expect(m.put).toHaveBeenCalledWith('/api/users/1', {
    fullName: 'New',
    email: 'n@x',
  })
  expect(result.current.users[0]).toMatchObject({
    fullName: 'New',
    email: 'n@x',
  })
  expect(result.current.saving).toBe(false)
})

it('sends the role only when it changed', async () => {
  const { result } = await setup()
  act(() => result.current.handleEditClick(result.current.users[0]!))
  act(() =>
    result.current.handleEditSave({ fullName: 'Old', email: 'o@x', role: 2 }),
  )
  await waitFor(() => expect(result.current.editUser).toBeNull())
  expect(m.put).toHaveBeenCalledWith('/api/users/1', {
    fullName: 'Old',
    email: 'o@x',
    role: 2,
  })
  expect(result.current.users[0]!.role).toBe(2)
})
