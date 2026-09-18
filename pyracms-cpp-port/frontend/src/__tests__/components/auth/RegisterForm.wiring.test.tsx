import { screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import * as h from '../../helpers/registerForm'

jest.mock('@/hooks/useRegister', () => ({ useRegister: jest.fn() }))

const { renderForm } = h
beforeEach(() => h.resetRegister())

describe('RegisterForm – data-testid attributes', () => {
  it('form has data-testid="register-form"', () => {
    renderForm()
    expect(screen.getByTestId('register-form')).toBeInTheDocument()
  })

  it('submit button has data-testid="register-submit"', () => {
    renderForm()
    expect(screen.getByTestId('register-submit')).toBeInTheDocument()
  })
})

describe('RegisterForm – redirectTo prop', () => {
  it('passes redirectTo to useRegister when provided', () => {
    renderForm('/dashboard')
    expect(h.mockUseRegister).toHaveBeenCalledWith(
      '/dashboard', undefined,
    )
  })

  it('passes undefined to useRegister when redirectTo is omitted', () => {
    renderForm()
    expect(h.mockUseRegister).toHaveBeenCalledWith(
      undefined, undefined,
    )
  })
})

describe('RegisterForm – form submission', () => {
  it('calls handleSubmit when form is submitted', () => {
    renderForm()
    const form = screen.getByTestId('register-form')
    fireEvent.submit(form)
    expect(h.mockHandleSubmit).toHaveBeenCalledTimes(1)
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
    fireEvent.change(
      screen.getByTestId('register-confirm-password-input'),
      { target: { value: 'MyPass1!' } },
    )
    expect(h.mockUpdateField).toHaveBeenCalledWith(
      'confirmPassword', 'MyPass1!',
    )
  })
})
