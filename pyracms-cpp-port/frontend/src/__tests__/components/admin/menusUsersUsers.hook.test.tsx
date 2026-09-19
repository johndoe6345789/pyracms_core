import { renderHook, act, waitFor } from '@testing-library/react'
import { useCreateUser } from '@/components/admin/users/useCreateUser'
import { m } from '../../helpers/scopeApi'

jest.mock(
  '@/lib/api',
  () => jest.requireActual('../../helpers/apiMock').apiMock,
)

describe('useCreateUser', () => {
  beforeEach(() => jest.resetAllMocks())
  it('validates, submits, resets', async () => {
    const onCreated = jest.fn()
    m.post.mockResolvedValue({})
    const { result } = renderHook(() => useCreateUser(onCreated))
    expect(result.current.canSubmit).toBe(false)
    act(() => result.current.submit())
    expect(m.post).not.toHaveBeenCalled()
    act(() => {
      result.current.setUsername(' u ')
      result.current.setEmail('e@x')
      result.current.setPassword('p')
      result.current.setFullName(' F ')
      result.current.setOpen(true)
    })
    act(() => result.current.submit())
    await waitFor(() => expect(onCreated).toHaveBeenCalled())
    expect(m.post.mock.calls[0][1]).toMatchObject({
      username: 'u',
      fullName: 'F',
    })
    expect(result.current.username).toBe('')
  })

  it('reports api errors', async () => {
    m.post.mockRejectedValueOnce({ response: { data: { error: 'dup' } } })
    const { result } = renderHook(() => useCreateUser(jest.fn()))
    act(() => {
      result.current.setUsername('u')
      result.current.setEmail('e')
      result.current.setPassword('p')
    })
    act(() => result.current.submit())
    await waitFor(() => expect(result.current.error).toBe('dup'))
    m.post.mockRejectedValueOnce(new Error('x'))
    act(() => result.current.submit())
    await waitFor(() =>
      expect(result.current.error).toBe('Failed to create user'),
    )
  })
})
