import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import LoginHeader from '@/components/auth/LoginHeader'

/** Tests for LoginHeader error alert (present when non-empty). */
describe('LoginHeader', () => {
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
      expect(screen.getByTestId('login-error')).toBeInTheDocument()
    })

    it('different messages are displayed verbatim', () => {
      const msg = 'Account locked – too many attempts'
      render(<LoginHeader error={msg} />)
      expect(
        screen.getByTestId('login-error'),
      ).toHaveTextContent(msg)
    })
  })
})
