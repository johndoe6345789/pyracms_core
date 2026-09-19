/** RegisterFields: presence and data-testid of the six inputs. */
import { screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { setup } from '../../helpers/registerFieldsSetup'

describe('RegisterFields – field rendering', () => {
  it('renders the username input with correct data-testid', () => {
    setup()
    expect(
      screen.getByTestId('register-username-input'),
    ).toBeInTheDocument()
  })

  it('renders the email input with correct data-testid', () => {
    setup()
    expect(
      screen.getByTestId('register-email-input'),
    ).toBeInTheDocument()
  })

  it('renders the password input with correct data-testid', () => {
    setup()
    expect(
      screen.getByTestId('register-password-input'),
    ).toBeInTheDocument()
  })

  it('renders the confirm-password input with correct data-testid', () => {
    setup()
    expect(
      screen.getByTestId('register-confirm-password-input'),
    ).toBeInTheDocument()
  })

  it('renders the first-name input with correct data-testid', () => {
    setup()
    expect(
      screen.getByTestId('register-firstname-input'),
    ).toBeInTheDocument()
  })

  it('renders the last-name input with correct data-testid', () => {
    setup()
    expect(
      screen.getByTestId('register-lastname-input'),
    ).toBeInTheDocument()
  })
})
