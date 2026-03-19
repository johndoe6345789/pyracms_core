import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import LoginHeader from '@/components/auth/LoginHeader'

/**
 * Tests for LoginHeader.
 *
 * Covers: icon, heading, subtitle, error alert (conditional),
 * info alert (always present), ARIA attributes, and
 * data-testid attributes.
 */
describe('LoginHeader', () => {
  describe('static content', () => {
    it('renders the "Welcome Back" heading', () => {
      render(<LoginHeader error="" />)
      expect(
        screen.getByRole('heading', { name: /welcome back/i }),
      ).toBeInTheDocument()
    })

    it('renders the subtitle text', () => {
      render(<LoginHeader error="" />)
      expect(
        screen.getByText(/sign in to continue to pyracms/i),
      ).toBeInTheDocument()
    })

    it('renders the login icon with aria-hidden', () => {
      const { container } = render(<LoginHeader error="" />)
      // MUI SvgIcon renders an <svg> element; aria-hidden
      // must be "true" so screen readers skip the icon.
      const svg = container.querySelector('svg')
      expect(svg).toBeInTheDocument()
      expect(svg).toHaveAttribute('aria-hidden', 'true')
    })
  })

  describe('info alert', () => {
    it('is always rendered regardless of error state', () => {
      render(<LoginHeader error="" />)
      expect(
        screen.getByTestId('login-info'),
      ).toBeInTheDocument()
    })

    it('contains the test credentials', () => {
      render(<LoginHeader error="" />)
      const info = screen.getByTestId('login-info')
      expect(info).toHaveTextContent('admin')
      expect(info).toHaveTextContent('password123')
    })

    it('is still rendered when an error is present', () => {
      render(<LoginHeader error="Bad credentials" />)
      expect(
        screen.getByTestId('login-info'),
      ).toBeInTheDocument()
    })
  })

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
