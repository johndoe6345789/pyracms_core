import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import LoginHeader from '@/components/auth/LoginHeader'

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
})
