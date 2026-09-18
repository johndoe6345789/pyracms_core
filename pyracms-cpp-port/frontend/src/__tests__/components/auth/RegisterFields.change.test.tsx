import { screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { setup } from '../../helpers/registerFields'

const change = (id: string, value: string) =>
  fireEvent.change(screen.getByTestId(id), { target: { value } })

describe('RegisterFields – onChange callbacks', () => {
  it('calls updateField("username", value) on username change', () => {
    const { updateField } = setup()
    change('register-username-input', 'alice')
    expect(updateField).toHaveBeenCalledWith('username', 'alice')
  })

  it('calls updateField("email", value) on email change', () => {
    const { updateField } = setup()
    change('register-email-input', 'alice@example.com')
    expect(updateField).toHaveBeenCalledWith(
      'email', 'alice@example.com',
    )
  })

  it('calls updateField("password", value) on password change', () => {
    const { updateField } = setup()
    change('register-password-input', 'secret123')
    expect(updateField).toHaveBeenCalledWith('password', 'secret123')
  })

  it('calls updateField("confirmPassword", value) on confirm change', () => {
    const { updateField } = setup()
    change('register-confirm-password-input', 'secret123')
    expect(updateField).toHaveBeenCalledWith(
      'confirmPassword', 'secret123',
    )
  })

  it('calls updateField("firstName", value) on firstName change', () => {
    const { updateField } = setup()
    change('register-firstname-input', 'Alice')
    expect(updateField).toHaveBeenCalledWith('firstName', 'Alice')
  })

  it('calls updateField("lastName", value) on lastName change', () => {
    const { updateField } = setup()
    change('register-lastname-input', 'Smith')
    expect(updateField).toHaveBeenCalledWith('lastName', 'Smith')
  })
})
