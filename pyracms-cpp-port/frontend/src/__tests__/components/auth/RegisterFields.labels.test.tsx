/** RegisterFields: aria-label on each input. */
import { screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { setup } from '../../helpers/registerFieldsSetup'

describe('RegisterFields – aria-labels', () => {
  it('username input has aria-label "Username"', () => {
    setup()
    expect(
      screen.getByTestId('register-username-input'),
    ).toHaveAttribute('aria-label', 'Username')
  })

  it('email input has aria-label "Email address"', () => {
    setup()
    expect(
      screen.getByTestId('register-email-input'),
    ).toHaveAttribute('aria-label', 'Email address')
  })

  it('password input has aria-label "Password"', () => {
    setup()
    expect(
      screen.getByTestId('register-password-input'),
    ).toHaveAttribute('aria-label', 'Password')
  })

  it('confirm-password input has aria-label "Confirm password"', () => {
    setup()
    expect(
      screen.getByTestId('register-confirm-password-input'),
    ).toHaveAttribute('aria-label', 'Confirm password')
  })

  it('first-name input has aria-label "First name"', () => {
    setup()
    expect(
      screen.getByTestId('register-firstname-input'),
    ).toHaveAttribute('aria-label', 'First name')
  })

  it('last-name input has aria-label "Last name"', () => {
    setup()
    expect(
      screen.getByTestId('register-lastname-input'),
    ).toHaveAttribute('aria-label', 'Last name')
  })
})
