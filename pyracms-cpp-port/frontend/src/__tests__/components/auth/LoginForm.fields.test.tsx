import { screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'

import {
  renderLoginForm,
  resetMockState,
  setMockState,
} from '../../helpers/loginFormMock'

jest.mock('next/navigation', () =>
  require('../../helpers/loginFormMock').navigationModule())
jest.mock('@/hooks/useLogin', () =>
  require('../../helpers/loginFormMock').loginHookModule())

beforeEach(() => {
  resetMockState()
})

describe('LoginForm – field update callbacks', () => {
  it('calls updateField with "username" when username '
    + 'input changes', () => {
    const updateField = jest.fn()
    setMockState({ updateField })
    renderLoginForm()
    const input = screen.getByTestId('username-input')
    fireEvent.change(input, {
      target: { value: 'testuser' },
    })
    expect(updateField).toHaveBeenCalledWith(
      'username',
      'testuser',
    )
  })

  it('calls updateField with "password" when password '
    + 'input changes', () => {
    const updateField = jest.fn()
    setMockState({ updateField })
    renderLoginForm()
    const input = screen.getByTestId('password-input')
    fireEvent.change(input, {
      target: { value: 'secret' },
    })
    expect(updateField).toHaveBeenCalledWith(
      'password',
      'secret',
    )
  })
})

describe('LoginForm – HTML5 required validation', () => {
  it('username input has required attribute', () => {
    renderLoginForm()
    expect(
      screen.getByTestId('username-input'),
    ).toBeRequired()
  })

  it('password input has required attribute', () => {
    renderLoginForm()
    expect(
      screen.getByTestId('password-input'),
    ).toBeRequired()
  })
})
