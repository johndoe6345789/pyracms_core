import {
  render, screen, fireEvent, within, renderHook, act, waitFor,
} from '@testing-library/react'
import CreateUserDialog from '@/components/admin/users/CreateUserDialog'
import { useCreateUser } from '@/components/admin/users/useCreateUser'
import { m } from '../../helpers/scopeApi'

jest.mock('@/lib/api', () => require('../../helpers/apiMock').apiMock)

const box = (id: string) =>
  within(screen.getByTestId(id)).getByRole('textbox')

const userState = (over = {}) => ({
  open: true, setOpen: jest.fn(), username: 'u', setUsername: jest.fn(),
  email: 'e', setEmail: jest.fn(), fullName: 'f', setFullName: jest.fn(),
  password: 'p', setPassword: jest.fn(), error: '', creating: false,
  canSubmit: true, submit: jest.fn(), ...over,
})

it('CreateUserDialog wires inputs', () => {
  const s = userState({ error: 'bad' })
  render(<CreateUserDialog s={s as never} />)
  expect(screen.getByTestId('create-user-error')).toHaveTextContent('bad')
  fireEvent.change(box('new-username-input'), { target: { value: 'a' } })
  fireEvent.change(box('new-email-input'), { target: { value: 'b@c' } })
  fireEvent.change(box('new-fullname-input'), { target: { value: 'c' } })
  fireEvent.change(
    screen.getByTestId('new-password-input').querySelector('input')!,
    { target: { value: 'd' } })
  fireEvent.click(screen.getByTestId('submit-create-btn'))
  fireEvent.click(screen.getByTestId('cancel-create-btn'))
  expect(s.setUsername).toHaveBeenCalledWith('a')
  expect(s.submit).toHaveBeenCalled()
  expect(s.setOpen).toHaveBeenCalledWith(false)
})
it('CreateUserDialog shows creating label', () => {
  render(<CreateUserDialog s={userState({ creating: true }) as never} />)
  expect(screen.getByText('Creating...')).toBeInTheDocument()
})

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
    expect(m.post.mock.calls[0][1]).toMatchObject(
      { username: 'u', fullName: 'F' })
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
      expect(result.current.error).toBe('Failed to create user'))
  })
})
