import { screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import * as h from '../../helpers/registerForm'

jest.mock('@/hooks/useRegister', () => ({ useRegister: jest.fn() }))

const { renderForm, withReturn } = h
beforeEach(() => h.resetRegister())

describe('RegisterForm – heading', () => {
  it('renders a heading with text "Register"', () => {
    renderForm()
    expect(
      screen.getByRole('heading', { name: /register/i }),
    ).toBeInTheDocument()
  })
})

describe('RegisterForm – error alert', () => {
  it('does not show an error alert by default', () => {
    renderForm()
    expect(
      screen.queryByTestId('register-error'),
    ).not.toBeInTheDocument()
  })

  it('shows error alert when error is non-empty', () => {
    withReturn({ error: 'Username already taken' })
    renderForm()
    expect(screen.getByTestId('register-error')).toBeInTheDocument()
  })

  it('error alert displays the error message text', () => {
    withReturn({ error: 'Something went wrong' })
    renderForm()
    expect(screen.getByTestId('register-error')).toHaveTextContent(
      'Something went wrong',
    )
  })

  it('error alert has id="register-error-msg"', () => {
    withReturn({ error: 'err' })
    renderForm()
    expect(screen.getByTestId('register-error')).toHaveAttribute(
      'id', 'register-error-msg',
    )
  })

  it('error alert has role="alert"', () => {
    withReturn({ error: 'err' })
    renderForm()
    expect(screen.getByTestId('register-error')).toHaveAttribute(
      'role', 'alert',
    )
  })

  it('error alert has aria-live="assertive"', () => {
    withReturn({ error: 'err' })
    renderForm()
    expect(screen.getByTestId('register-error')).toHaveAttribute(
      'aria-live', 'assertive',
    )
  })
})
