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
  m.get.mockResolvedValue({ data: [
    { id: 1, username: 'u', banned: false, role: 2 }] })
  m.put.mockResolvedValue({})
  m.delete.mockResolvedValue({})
})

it('maps the role of each account', async () => {
  const { result } = await setup()
  expect(result.current.users[0]!.role).toBe(2)
})

it('bans and unbans through the ban endpoint', async () => {
  const { result } = await setup()
  act(() => result.current.handleToggleBan(1))
  await waitFor(() => expect(result.current.users[0]!.banned).toBe(true))
  expect(m.put).toHaveBeenCalledWith('/api/users/1/ban', { banned: true })
  act(() => result.current.handleToggleBan(1))
  await waitFor(() => expect(result.current.users[0]!.banned).toBe(false))
  expect(m.put).toHaveBeenLastCalledWith(
    '/api/users/1/ban', { banned: false })
})

it('reports a refused ban and keeps the state', async () => {
  m.put.mockRejectedValueOnce(
    { response: { data: { error: 'Account has an equal or higher role' } } })
  const { result } = await setup()
  act(() => result.current.handleToggleBan(1))
  await waitFor(() => expect(result.current.actionError)
    .toBe('Account has an equal or higher role'))
  expect(result.current.users[0]!.banned).toBe(false)
  act(() => result.current.handleToggleBan(1))
  await waitFor(() => expect(result.current.actionError).toBe(''))
})

it('reports a refused delete and keeps the row', async () => {
  m.delete.mockRejectedValueOnce(new Error('boom'))
  const { result } = await setup()
  act(() => result.current.handleDeleteClick(result.current.users[0]!))
  act(() => result.current.handleDeleteConfirm())
  await waitFor(() =>
    expect(result.current.actionError).toBe('Failed to delete user'))
  expect(result.current.users).toHaveLength(1)
})
