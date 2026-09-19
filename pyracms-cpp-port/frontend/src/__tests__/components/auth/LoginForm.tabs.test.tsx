import { screen } from '@testing-library/react'
import '@testing-library/jest-dom'

import { renderLoginForm, resetMockState } from '../../helpers/loginFormMock'

jest.mock('next/navigation', () =>
  jest.requireActual('../../helpers/loginFormMock').navigationModule(),
)
jest.mock('@/hooks/useLogin', () =>
  jest.requireActual('../../helpers/loginFormMock').loginHookModule(),
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
  const domIndex = (id: string) =>
    Array.from(document.querySelectorAll('*')).indexOf(screen.getByTestId(id))

  it('username input appears before password input in DOM', () => {
    renderLoginForm()
    expect(domIndex('username-input')).toBeLessThan(domIndex('password-input'))
  })

  it('password input appears before submit button in DOM', () => {
    renderLoginForm()
    expect(domIndex('password-input')).toBeLessThan(domIndex('login-submit'))
  })

  it('submit button appears before register link in DOM', () => {
    renderLoginForm()
    expect(domIndex('login-submit')).toBeLessThan(domIndex('register-link'))
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
