import { renderHook, act, waitFor } from '@testing-library/react'
import { useAdminUsers } from '@/hooks/useAdminUsers'
import { m } from '../../helpers/scopeApi'

jest.mock('@/lib/api', () => require('../../helpers/apiMock').apiMock)

const edit = { fullName: 'a', email: 'b', role: 1 }

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

it('reports server and generic errors', async () => {
  const { result } = await setup()
  act(() => result.current.handleEditClick(result.current.users[0]!))
  m.put.mockRejectedValueOnce({ response: { data: { error: 'Forbidden' } } })
  act(() => result.current.handleEditSave(edit))
  await waitFor(() => expect(result.current.editError).toBe('Forbidden'))
  m.put.mockRejectedValueOnce(new Error('x'))
  act(() => result.current.handleEditSave(edit))
  await waitFor(() =>
    expect(result.current.editError).toBe('Failed to update user'),
  )
  expect(result.current.editUser).not.toBeNull()
})

it('ignores save without a selected user', async () => {
  const { result } = await setup()
  act(() => result.current.handleEditSave(edit))
  expect(m.put).not.toHaveBeenCalled()
})
