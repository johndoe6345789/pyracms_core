/** RegisterForm: redirectTo, submission, confirm-password wiring. */
import { screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import {
  mockHandleSubmit,
  mockUpdateField,
  mockUseRegister,
  renderForm,
  resetRegisterMocks,
} from '../../helpers/registerFormMocks'

jest.mock('@/hooks/useRegister', () => ({
  useRegister: jest.fn(),
}))

beforeEach(resetRegisterMocks)

describe('RegisterForm – redirectTo prop', () => {
  it('passes redirectTo to useRegister when provided', () => {
    renderForm('/dashboard')
    expect(mockUseRegister).toHaveBeenCalledWith('/dashboard', undefined)
  })

  it('passes undefined to useRegister when redirectTo is omitted', () => {
    renderForm()
    expect(mockUseRegister).toHaveBeenCalledWith(undefined, undefined)
  })
})

describe('RegisterForm – form submission', () => {
  it('calls handleSubmit when form is submitted', () => {
    renderForm()
    const form = screen.getByTestId('register-form')
    fireEvent.submit(form)
    expect(mockHandleSubmit).toHaveBeenCalledTimes(1)
  })
})

describe('RegisterForm – confirm-password field integration', () => {
  it('renders the confirm-password input', () => {
    renderForm()
    expect(
      screen.getByTestId('register-confirm-password-input'),
    ).toBeInTheDocument()
  })

  it('calls updateField("confirmPassword", …) on input change', () => {
    renderForm()
    fireEvent.change(screen.getByTestId('register-confirm-password-input'), {
      target: { value: 'MyPass1!' },
    })
    expect(mockUpdateField).toHaveBeenCalledWith('confirmPassword', 'MyPass1!')
  })
})
