import { screen } from '@testing-library/react'
import '@testing-library/jest-dom'

import { renderLoginForm, resetMockState } from '../../helpers/loginFormMock'

jest.mock('next/navigation', () =>
  require('../../helpers/loginFormMock').navigationModule(),
)
jest.mock('@/hooks/useLogin', () =>
  require('../../helpers/loginFormMock').loginHookModule(),
)

beforeEach(() => {
  resetMockState()
})

describe('LoginForm – tab order', () => {
  /**
   * Tab order is enforced by DOM source order. We verify
   * the correct sequential position in the document rather
   * than simulating Tab key presses (which jsdom does not
   * fully support without user-event).
   */
  it('username input appears before password input in DOM', () => {
    renderLoginForm()
    const username = screen.getByTestId('username-input')
    const password = screen.getByTestId('password-input')
    expect(
      // eslint-disable-next-line no-bitwise
      username.compareDocumentPosition(password) &
        // Node.DOCUMENT_POSITION_FOLLOWING === 4
        4,
    ).toBeTruthy()
  })

  it('password input appears before submit button in DOM', () => {
    renderLoginForm()
    const password = screen.getByTestId('password-input')
    const submit = screen.getByTestId('login-submit')
    // eslint-disable-next-line no-bitwise
    expect(password.compareDocumentPosition(submit) & 4).toBeTruthy()
  })

  it('submit button appears before register link in DOM', () => {
    renderLoginForm()
    const submit = screen.getByTestId('login-submit')
    const register = screen.getByTestId('register-link')
    // eslint-disable-next-line no-bitwise
    expect(submit.compareDocumentPosition(register) & 4).toBeTruthy()
  })

  it('none of the interactive elements have tabIndex < 0', () => {
    renderLoginForm()
    const elements = [
      screen.getByTestId('username-input'),
      screen.getByTestId('password-input'),
      screen.getByTestId('login-submit'),
      screen.getByTestId('register-link'),
      screen.getByTestId('forgot-password-link'),
    ]
    for (const el of elements) {
      const ti = el.getAttribute('tabindex')
      if (ti !== null) {
        expect(Number(ti)).toBeGreaterThanOrEqual(0)
      }
    }
  })
})
