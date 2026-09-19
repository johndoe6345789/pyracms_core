/** RegisterForm: strength indicator and errorId integration. */
import { screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import {
  defaultReturn,
  mockState,
  renderForm,
  resetRegisterMocks,
} from '../../helpers/registerFormMocks'

jest.mock('@/hooks/useRegister', () => ({
  useRegister: jest.fn(),
}))

beforeEach(resetRegisterMocks)

const strongForm = {
  ...defaultReturn.formData,
  password: 'Abcdef1!',
}

describe('RegisterForm – password strength indicator integration', () => {
  it('shows strength indicator when password is non-empty', () => {
    mockState({ formData: strongForm })
    renderForm()
    expect(screen.getByTestId('password-strength')).toBeInTheDocument()
  })

  it('does not show strength indicator when password is empty', () => {
    renderForm()
    expect(screen.queryByTestId('password-strength')).not.toBeInTheDocument()
  })

  it('strength label says "Strong" for a complex password', () => {
    mockState({ formData: strongForm })
    renderForm()
    expect(screen.getByTestId('password-strength-label')).toHaveTextContent(
      'Strong',
    )
  })

  it('errorId prop wires aria-describedby when error is present', () => {
    // MUI places aria-describedby on the FormControl root <div>,
    // not on the native <input>.
    mockState({ error: 'Registration failed' })
    renderForm()
    const input = screen.getByTestId('register-username-input')
    const wrapper = input.closest('[aria-describedby]')
    expect(wrapper).toHaveAttribute('aria-describedby', 'register-error-msg')
  })

  it('errorId prop is absent (no wrapper) when no error', () => {
    renderForm()
    const input = screen.getByTestId('register-username-input')
    expect(input.closest('[aria-describedby]')).toBeNull()
  })
})
