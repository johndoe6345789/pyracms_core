import { screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import * as h from '../../helpers/registerForm'

jest.mock('@/hooks/useRegister', () => ({ useRegister: jest.fn() }))

const { renderForm, withReturn, defaultReturn } = h
beforeEach(() => h.resetRegister())

describe('RegisterForm – password strength indicator integration', () => {
  const strong = {
    formData: { ...defaultReturn.formData, password: 'Abcdef1!' },
  }

  it('shows strength indicator when password is non-empty', () => {
    withReturn(strong)
    renderForm()
    expect(screen.getByTestId('password-strength')).toBeInTheDocument()
  })

  it('does not show strength indicator when password is empty', () => {
    renderForm()
    expect(
      screen.queryByTestId('password-strength'),
    ).not.toBeInTheDocument()
  })

  it('strength label says "Strong" for a complex password', () => {
    withReturn(strong)
    renderForm()
    expect(
      screen.getByTestId('password-strength-label'),
    ).toHaveTextContent('Strong')
  })

  it('errorId prop wires aria-describedby when error is present', () => {
    // MUI places aria-describedby on the FormControl root <div>,
    // not on the native <input>.
    withReturn({ error: 'Registration failed' })
    renderForm()
    const input = screen.getByTestId('register-username-input')
    const wrapper = input.closest('[aria-describedby]')
    expect(wrapper).toHaveAttribute(
      'aria-describedby', 'register-error-msg',
    )
  })

  it('errorId prop is absent (no wrapper) when no error', () => {
    renderForm()
    const input = screen.getByTestId('register-username-input')
    expect(input.closest('[aria-describedby]')).toBeNull()
  })
})
