import { render, screen } from '@testing-library/react'
import Home from '@/app/page'

describe('Home Page', () => {
  it('renders welcome message', () => {
    render(<Home />)
    const heading = screen.getByText(/Welcome to PyraCMS/i)
    expect(heading).toBeInTheDocument()
  })

  it('renders login button', () => {
    render(<Home />)
    const loginButton = screen.getByRole('link', { name: /login/i })
    expect(loginButton).toBeInTheDocument()
  })

  it('renders register button', () => {
    render(<Home />)
    const registerButton = screen.getByRole('link', { name: /register/i })
    expect(registerButton).toBeInTheDocument()
  })
})
