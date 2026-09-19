/** RegisterForm: heading, login link, testids (useRegister mocked). */
import { screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import {
  renderForm,
  resetRegisterMocks,
} from '../../helpers/registerFormMocks'

jest.mock('@/hooks/useRegister', () => ({
  useRegister: jest.fn(),
}))

beforeEach(resetRegisterMocks)

describe('RegisterForm – heading', () => {
  it('renders a heading with text "Register"', () => {
    renderForm()
    expect(
      screen.getByRole('heading', { name: /register/i }),
    ).toBeInTheDocument()
  })
})

describe('RegisterForm – login link', () => {
  it('has data-testid="login-link"', () => {
    renderForm()
    expect(screen.getByTestId('login-link')).toBeInTheDocument()
  })

  it('href points to "/auth/login"', () => {
    renderForm()
    expect(screen.getByTestId('login-link')).toHaveAttribute(
      'href',
      '/auth/login',
    )
  })

  it('has aria-label "Go to login page"', () => {
    renderForm()
    expect(screen.getByTestId('login-link')).toHaveAttribute(
      'aria-label',
      'Go to login page',
    )
  })
})

describe('RegisterForm – data-testid attributes', () => {
  it('form has data-testid="register-form"', () => {
    renderForm()
    expect(
      screen.getByTestId('register-form'),
    ).toBeInTheDocument()
  })

  it('submit button has data-testid="register-submit"', () => {
    renderForm()
    expect(
      screen.getByTestId('register-submit'),
    ).toBeInTheDocument()
  })
})
