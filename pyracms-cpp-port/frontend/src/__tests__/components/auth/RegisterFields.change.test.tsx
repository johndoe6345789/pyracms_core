/** RegisterFields: onChange fires updateField(key, value). */
import { screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { setup } from '../../helpers/registerFieldsSetup'

describe('RegisterFields – onChange callbacks', () => {
  it('calls updateField("username", value) on username change', () => {
    const { updateField } = setup()
    fireEvent.change(screen.getByTestId('register-username-input'), {
      target: { value: 'alice' },
    })
    expect(updateField).toHaveBeenCalledWith('username', 'alice')
  })

  it('calls updateField("email", value) on email change', () => {
    const { updateField } = setup()
    fireEvent.change(screen.getByTestId('register-email-input'), {
      target: { value: 'alice@example.com' },
    })
    expect(updateField).toHaveBeenCalledWith('email', 'alice@example.com')
  })

  it('calls updateField("password", value) on password change', () => {
    const { updateField } = setup()
    fireEvent.change(screen.getByTestId('register-password-input'), {
      target: { value: 'secret123' },
    })
    expect(updateField).toHaveBeenCalledWith('password', 'secret123')
  })

  it('calls updateField("confirmPassword", value) on confirm change', () => {
    const { updateField } = setup()
    fireEvent.change(screen.getByTestId('register-confirm-password-input'), {
      target: { value: 'secret123' },
    })
    expect(updateField).toHaveBeenCalledWith('confirmPassword', 'secret123')
  })

  it('calls updateField("firstName", value) on firstName change', () => {
    const { updateField } = setup()
    fireEvent.change(screen.getByTestId('register-firstname-input'), {
      target: { value: 'Alice' },
    })
    expect(updateField).toHaveBeenCalledWith('firstName', 'Alice')
  })

  it('calls updateField("lastName", value) on lastName change', () => {
    const { updateField } = setup()
    fireEvent.change(screen.getByTestId('register-lastname-input'), {
      target: { value: 'Smith' },
    })
    expect(updateField).toHaveBeenCalledWith('lastName', 'Smith')
  })
})
