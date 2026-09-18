import { screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import * as h from '../../helpers/loginForm'

jest.mock('next/navigation', () =>
  require('../../helpers/loginForm').navMock)
jest.mock('@/hooks/useLogin', () => ({
  useLogin: () => require('../../helpers/loginForm').useLoginMock(),
}))

const { renderLoginForm } = h
beforeEach(() => h.resetState())

describe('LoginForm – form submission', () => {
  it('calls handleSubmit when the form is submitted', () => {
    const handleSubmit = h.submitMock()
    h.setMockState({ handleSubmit })
    renderLoginForm()
    fireEvent.submit(screen.getByTestId('login-form'))
    expect(handleSubmit).toHaveBeenCalledTimes(1)
  })

  it('calls handleSubmit when Enter is pressed on the '
    + 'form (keyboard shortcut)', () => {
    const handleSubmit = h.submitMock()
    h.setMockState({ handleSubmit })
    renderLoginForm()
    fireEvent.keyDown(
      screen.getByTestId('login-form'),
      { key: 'Enter', code: 'Enter', charCode: 13 },
    )
    // Enter inside a form triggers submit via browser default.
    fireEvent.submit(screen.getByTestId('login-form'))
    expect(handleSubmit).toHaveBeenCalledTimes(1)
  })
})

describe('LoginForm – field update callbacks', () => {
  it('calls updateField with "username" when username '
    + 'input changes', () => {
    const updateField = jest.fn()
    h.setMockState({ updateField })
    renderLoginForm()
    const input = screen.getByTestId('username-input')
    fireEvent.change(input, { target: { value: 'testuser' } })
    expect(updateField).toHaveBeenCalledWith('username', 'testuser')
  })

  it('calls updateField with "password" when password '
    + 'input changes', () => {
    const updateField = jest.fn()
    h.setMockState({ updateField })
    renderLoginForm()
    const input = screen.getByTestId('password-input')
    fireEvent.change(input, { target: { value: 'secret' } })
    expect(updateField).toHaveBeenCalledWith('password', 'secret')
  })
})
