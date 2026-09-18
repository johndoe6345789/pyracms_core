import { screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { setup } from '../../helpers/registerFields'

const field = (id: string) => screen.getByTestId(id)

describe('RegisterFields – aria-labels', () => {
  it('username input has aria-label "Username"', () => {
    setup()
    expect(field('register-username-input'))
      .toHaveAttribute('aria-label', 'Username')
  })

  it('email input has aria-label "Email address"', () => {
    setup()
    expect(field('register-email-input'))
      .toHaveAttribute('aria-label', 'Email address')
  })

  it('password input has aria-label "Password"', () => {
    setup()
    expect(field('register-password-input'))
      .toHaveAttribute('aria-label', 'Password')
  })

  it('confirm-password input has aria-label "Confirm password"', () => {
    setup()
    expect(field('register-confirm-password-input'))
      .toHaveAttribute('aria-label', 'Confirm password')
  })

  it('first-name input has aria-label "First name"', () => {
    setup()
    expect(field('register-firstname-input'))
      .toHaveAttribute('aria-label', 'First name')
  })

  it('last-name input has aria-label "Last name"', () => {
    setup()
    expect(field('register-lastname-input'))
      .toHaveAttribute('aria-label', 'Last name')
  })
})

describe('RegisterFields – aria-describedby', () => {
  it('sets aria-describedby on username wrapper when errorId provided', () => {
    // MUI places aria-describedby on the FormControl root <div>,
    // not directly on the <input> element.
    setup({}, jest.fn(), 'register-error-msg')
    const input = field('register-username-input')
    const wrapper = input.closest('[aria-describedby]')
    expect(wrapper).toHaveAttribute(
      'aria-describedby', 'register-error-msg',
    )
  })

  it('has no aria-describedby ancestor on username when errorId absent', () => {
    setup()
    const input = field('register-username-input')
    const wrapper = input.closest('[aria-describedby]')
    expect(wrapper).toBeNull()
  })
})
