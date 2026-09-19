/** RegisterForm: submit button (useRegister is fully mocked). */
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

describe('RegisterForm – submit button', () => {
  it('shows "Register" text when not loading', () => {
    renderForm()
    expect(screen.getByTestId('register-submit')).toHaveTextContent('Register')
  })

  it('shows "Registering..." text when loading', () => {
    mockState({ loading: true })
    renderForm()
    expect(screen.getByTestId('register-submit')).toHaveTextContent(
      'Registering...',
    )
  })

  it('is enabled when not loading', () => {
    renderForm()
    expect(screen.getByTestId('register-submit')).not.toBeDisabled()
  })

  it('is disabled when loading', () => {
    mockState({ loading: true })
    renderForm()
    expect(screen.getByTestId('register-submit')).toBeDisabled()
  })

  it('has aria-label "Register" when not loading', () => {
    renderForm()
    expect(screen.getByTestId('register-submit')).toHaveAttribute(
      'aria-label',
      'Register',
    )
  })

  it('has aria-label "Registering" when loading', () => {
    mockState({ loading: true })
    renderForm()
    expect(screen.getByTestId('register-submit')).toHaveAttribute(
      'aria-label',
      'Registering',
    )
  })
})
