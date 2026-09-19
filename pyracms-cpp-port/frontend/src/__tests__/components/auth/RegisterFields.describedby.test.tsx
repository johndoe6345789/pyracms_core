/** RegisterFields: aria-describedby wiring from errorId. */
import { screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { setup } from '../../helpers/registerFieldsSetup'

describe('RegisterFields – aria-describedby', () => {
  it('sets aria-describedby on username wrapper when errorId provided', () => {
    // MUI places aria-describedby on the FormControl root <div>,
    // not directly on the <input> element.
    setup({}, jest.fn(), 'register-error-msg')
    const input = screen.getByTestId('register-username-input')
    const wrapper = input.closest('[aria-describedby]')
    expect(wrapper).toHaveAttribute('aria-describedby', 'register-error-msg')
  })

  it('has no aria-describedby ancestor on username when errorId absent', () => {
    setup()
    const input = screen.getByTestId('register-username-input')
    const wrapper = input.closest('[aria-describedby]')
    expect(wrapper).toBeNull()
  })
})
