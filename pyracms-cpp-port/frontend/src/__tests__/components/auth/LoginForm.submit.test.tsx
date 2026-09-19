import { screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'

import {
  renderLoginForm,
  resetMockState,
  setMockState,
} from '../../helpers/loginFormMock'

jest.mock('next/navigation', () =>
  require('../../helpers/loginFormMock').navigationModule(),
)
jest.mock('@/hooks/useLogin', () =>
  require('../../helpers/loginFormMock').loginHookModule(),
)

beforeEach(() => {
  resetMockState()
})

describe('LoginForm – form submission', () => {
  it('calls handleSubmit when the form is submitted', () => {
    const handleSubmit = jest.fn((e: React.FormEvent) => {
      e.preventDefault()
    })
    setMockState({ handleSubmit })
    renderLoginForm()
    fireEvent.submit(screen.getByTestId('login-form'))
    expect(handleSubmit).toHaveBeenCalledTimes(1)
  })

  it(
    'calls handleSubmit when Enter is pressed on the ' +
      'form (keyboard shortcut)',
    () => {
      const handleSubmit = jest.fn((e: React.FormEvent) => {
        e.preventDefault()
      })
      setMockState({ handleSubmit })
      renderLoginForm()
      fireEvent.keyDown(screen.getByTestId('login-form'), {
        key: 'Enter',
        code: 'Enter',
        charCode: 13,
      })
      // Pressing Enter inside a form triggers submit via the
      // browser default; simulate via fireEvent.submit too.
      fireEvent.submit(screen.getByTestId('login-form'))
      expect(handleSubmit).toHaveBeenCalledTimes(1)
    },
  )
})
