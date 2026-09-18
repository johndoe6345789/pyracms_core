import { screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import * as h from '../../helpers/registerForm'

jest.mock('@/hooks/useRegister', () => ({ useRegister: jest.fn() }))

const { renderForm, withReturn } = h
beforeEach(() => h.resetRegister())

describe('RegisterForm – submit button', () => {
  it('shows "Register" text when not loading', () => {
    renderForm()
    expect(
      screen.getByTestId('register-submit'),
    ).toHaveTextContent('Register')
  })

  it('shows "Registering..." text when loading', () => {
    withReturn({ loading: true })
    renderForm()
    expect(
      screen.getByTestId('register-submit'),
    ).toHaveTextContent('Registering...')
  })

  it('is enabled when not loading', () => {
    renderForm()
    expect(screen.getByTestId('register-submit')).not.toBeDisabled()
  })

  it('is disabled when loading', () => {
    withReturn({ loading: true })
    renderForm()
    expect(screen.getByTestId('register-submit')).toBeDisabled()
  })

  it('has aria-label "Register" when not loading', () => {
    renderForm()
    expect(
      screen.getByTestId('register-submit'),
    ).toHaveAttribute('aria-label', 'Register')
  })

  it('has aria-label "Registering" when loading', () => {
    withReturn({ loading: true })
    renderForm()
    expect(
      screen.getByTestId('register-submit'),
    ).toHaveAttribute('aria-label', 'Registering')
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
      'href', '/auth/login',
    )
  })

  it('has aria-label "Go to login page"', () => {
    renderForm()
    expect(screen.getByTestId('login-link')).toHaveAttribute(
      'aria-label', 'Go to login page',
    )
  })
})
