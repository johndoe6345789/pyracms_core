/** RegisterForm: error alert (useRegister is fully mocked). */
import { screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import {
  mockState,
  renderForm,
  resetRegisterMocks,
} from '../../helpers/registerFormMocks'

jest.mock('@/hooks/useRegister', () => ({
  useRegister: jest.fn(),
}))

beforeEach(resetRegisterMocks)

describe('RegisterForm – error alert', () => {
  it('does not show an error alert by default', () => {
    renderForm()
    expect(screen.queryByTestId('register-error')).not.toBeInTheDocument()
  })

  it('shows error alert when error is non-empty', () => {
    mockState({ error: 'Username already taken' })
    renderForm()
    expect(screen.getByTestId('register-error')).toBeInTheDocument()
  })

  it('error alert displays the error message text', () => {
    mockState({ error: 'Something went wrong' })
    renderForm()
    expect(screen.getByTestId('register-error')).toHaveTextContent(
      'Something went wrong',
    )
  })

  it('error alert has id="register-error-msg"', () => {
    mockState({ error: 'err' })
    renderForm()
    expect(screen.getByTestId('register-error')).toHaveAttribute(
      'id',
      'register-error-msg',
    )
  })

  it('error alert has role="alert"', () => {
    mockState({ error: 'err' })
    renderForm()
    expect(screen.getByTestId('register-error')).toHaveAttribute(
      'role',
      'alert',
    )
  })

  it('error alert has aria-live="assertive"', () => {
    mockState({ error: 'err' })
    renderForm()
    expect(screen.getByTestId('register-error')).toHaveAttribute(
      'aria-live',
      'assertive',
    )
  })
})
