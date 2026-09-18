import { screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import * as h from '../../helpers/loginForm'

jest.mock('next/navigation', () =>
  require('../../helpers/loginForm').navMock)
jest.mock('@/hooks/useLogin', () => ({
  useLogin: () => require('../../helpers/loginForm').useLoginMock(),
}))

const { renderLoginForm } = h
beforeEach(() => h.resetState())

describe('LoginForm – HTML5 required validation', () => {
  it('username input has required attribute', () => {
    renderLoginForm()
    expect(screen.getByTestId('username-input')).toBeRequired()
  })

  it('password input has required attribute', () => {
    renderLoginForm()
    expect(screen.getByTestId('password-input')).toBeRequired()
  })
})

describe('LoginForm – redirectTo prop', () => {
  it('accepts redirectTo prop without throwing', () => {
    expect(() => {
      renderLoginForm({ redirectTo: '/dashboard' })
    }).not.toThrow()
  })

  it('renders correctly when redirectTo is omitted', () => {
    expect(() => {
      renderLoginForm()
    }).not.toThrow()
    expect(screen.getByTestId('login-form')).toBeInTheDocument()
  })
})

describe('LoginForm – tab order', () => {
  // Tab order is enforced by DOM source order.
  const pos = (a: string, b: string) =>
    // eslint-disable-next-line no-bitwise
    screen.getByTestId(a).compareDocumentPosition(
      screen.getByTestId(b)) & 4

  it('username input appears before password input in DOM', () => {
    renderLoginForm()
    expect(pos('username-input', 'password-input')).toBeTruthy()
  })

  it('password input appears before submit button in DOM', () => {
    renderLoginForm()
    expect(pos('password-input', 'login-submit')).toBeTruthy()
  })

  it('submit button appears before register link in DOM', () => {
    renderLoginForm()
    expect(pos('login-submit', 'register-link')).toBeTruthy()
  })

  it('none of the interactive elements have tabIndex < 0', () => {
    renderLoginForm()
    const elements = [
      'username-input', 'password-input', 'login-submit',
      'register-link', 'forgot-password-link',
    ].map((id) => screen.getByTestId(id))
    for (const el of elements) {
      const ti = el.getAttribute('tabindex')
      if (ti !== null) {
        expect(Number(ti)).toBeGreaterThanOrEqual(0)
      }
    }
  })
})
