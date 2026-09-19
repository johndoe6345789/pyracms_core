import { screen } from '@testing-library/react'
import '@testing-library/jest-dom'

import {
  renderLoginForm,
  resetMockState,
  setMockState,
} from '../../helpers/loginFormMock'

jest.mock('next/navigation', () =>
  jest.requireActual('../../helpers/loginFormMock').navigationModule(),
)
jest.mock('@/hooks/useLogin', () =>
  jest.requireActual('../../helpers/loginFormMock').loginHookModule(),
)

beforeEach(() => {
  resetMockState()
})

describe('LoginForm – loading state', () => {
  it('disables the submit button while loading', () => {
    setMockState({ loading: true })
    renderLoginForm()
    expect(screen.getByTestId('login-submit')).toBeDisabled()
  })

  it('shows "Signing in..." text while loading', () => {
    setMockState({ loading: true })
    renderLoginForm()
    expect(screen.getByTestId('login-submit')).toHaveTextContent(/signing in/i)
  })

  it('enables the submit button when not loading', () => {
    setMockState({ loading: false })
    renderLoginForm()
    expect(screen.getByTestId('login-submit')).not.toBeDisabled()
  })
})

describe('LoginForm – error display', () => {
  it(
    'shows error message via LoginHeader when error ' +
      'is returned from the hook',
    () => {
      setMockState({ error: 'Invalid credentials' })
      renderLoginForm()
      expect(screen.getByTestId('login-error')).toHaveTextContent(
        'Invalid credentials',
      )
    },
  )

  it('does not show error alert when error is empty', () => {
    setMockState({ error: '' })
    renderLoginForm()
    expect(screen.queryByTestId('login-error')).not.toBeInTheDocument()
  })
})
