import { render, screen, fireEvent, within } from '@testing-library/react'
import CreateUserDialog from '@/components/admin/users/CreateUserDialog'

const box = (id: string) => within(screen.getByTestId(id)).getByRole('textbox')

const userState = (over = {}) => ({
  open: true,
  setOpen: jest.fn(),
  username: 'u',
  setUsername: jest.fn(),
  email: 'e',
  setEmail: jest.fn(),
  fullName: 'f',
  setFullName: jest.fn(),
  password: 'p',
  setPassword: jest.fn(),
  error: '',
  creating: false,
  canSubmit: true,
  submit: jest.fn(),
  ...over,
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
    { target: { value: 'd' } },
  )
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
