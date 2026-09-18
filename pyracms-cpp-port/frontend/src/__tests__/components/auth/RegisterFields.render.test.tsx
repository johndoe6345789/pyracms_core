import { screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { setup } from '../../helpers/registerFields'

const field = (id: string) => screen.getByTestId(id)

describe('RegisterFields – field rendering', () => {
  it('renders the username input with correct data-testid', () => {
    setup()
    expect(field('register-username-input')).toBeInTheDocument()
  })

  it('renders the email input with correct data-testid', () => {
    setup()
    expect(field('register-email-input')).toBeInTheDocument()
  })

  it('renders the password input with correct data-testid', () => {
    setup()
    expect(field('register-password-input')).toBeInTheDocument()
  })

  it('renders the confirm-password input with correct data-testid', () => {
    setup()
    expect(
      field('register-confirm-password-input'),
    ).toBeInTheDocument()
  })

  it('renders the first-name input with correct data-testid', () => {
    setup()
    expect(field('register-firstname-input')).toBeInTheDocument()
  })

  it('renders the last-name input with correct data-testid', () => {
    setup()
    expect(field('register-lastname-input')).toBeInTheDocument()
  })
})
