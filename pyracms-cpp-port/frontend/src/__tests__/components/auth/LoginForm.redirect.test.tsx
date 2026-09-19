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

describe('LoginForm – redirectTo prop', () => {
  it('accepts redirectTo prop without throwing', () => {
    expect(() => {
      renderLoginForm({ redirectTo: '/dashboard' })
    }).not.toThrow()
  })

  it('renders correctly when redirectTo is omitted', () => {
    expect(() => {
      renderLoginForm()
    }).not.toThrow()
    expect(screen.getByTestId('login-form')).toBeInTheDocument()
  })
})
