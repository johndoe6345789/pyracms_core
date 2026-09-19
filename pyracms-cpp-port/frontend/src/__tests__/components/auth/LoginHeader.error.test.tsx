import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import LoginHeader from '@/components/auth/LoginHeader'

describe('LoginHeader', () => {
  describe('error alert – absent when error is empty string', () => {
    it('does not render the error alert', () => {
      render(<LoginHeader error="" />)
      expect(
        screen.queryByTestId('login-error'),
      ).not.toBeInTheDocument()
    })

    it('does not render the error banner element', () => {
      render(<LoginHeader error="" />)
      // Only the error Alert carries data-testid="login-error".
      // MUI Alert renders role="alert" on ALL severity levels,
      // so we target by testid rather than role.
      expect(
        screen.queryByTestId('login-error'),
      ).not.toBeInTheDocument()
    })
  })

  describe('error alert – present when error is non-empty', () => {
    const ERROR_MSG = 'Invalid username or password'

    it('renders the error alert with the correct message', () => {
      render(<LoginHeader error={ERROR_MSG} />)
      expect(
        screen.getByTestId('login-error'),
      ).toHaveTextContent(ERROR_MSG)
    })

    it('has role="alert"', () => {
      render(<LoginHeader error={ERROR_MSG} />)
      // Both the error and info Alerts render role="alert" in
      // MUI; identify the error one via its testid.
      const alert = screen.getByTestId('login-error')
      expect(alert).toHaveAttribute('role', 'alert')
    })

    it('has aria-live="assertive"', () => {
      render(<LoginHeader error={ERROR_MSG} />)
      const alert = screen.getByTestId('login-error')
      expect(alert).toHaveAttribute('aria-live', 'assertive')
    })

    it('has data-testid="login-error"', () => {
      render(<LoginHeader error={ERROR_MSG} />)
      expect(
        screen.getByTestId('login-error'),
      ).toBeInTheDocument()
    })

    it('different messages are displayed verbatim', () => {
      const msg = 'Account locked \u2013 too many attempts'
      render(<LoginHeader error={msg} />)
      expect(
        screen.getByTestId('login-error'),
      ).toHaveTextContent(msg)
    })
  })
})
