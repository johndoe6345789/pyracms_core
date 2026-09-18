import { render, screen, fireEvent } from '@testing-library/react'
import LoginActions from '@/components/auth/LoginActions'
import LoginFooter from '@/components/auth/LoginFooter'
import RegisterFooter from '@/components/auth/RegisterFooter'
import TurboErrorDialog from '@/components/auth/TurboErrorDialog'

describe('LoginActions', () => {
  it('fires turbo and reflects loading', () => {
    const onTurbo = jest.fn()
    const { rerender } = render(
      <LoginActions loading={false} onTurbo={onTurbo} />)
    fireEvent.click(screen.getByTestId('turbo-login-button'))
    expect(onTurbo).toHaveBeenCalled()
    rerender(<LoginActions loading onTurbo={onTurbo} />)
    expect(screen.getByTestId('login-submit')).toBeDisabled()
    expect(screen.getByText('Signing in...')).toBeInTheDocument()
  })
})

describe('footers', () => {
  it('links to register with and without a tenant', () => {
    const { rerender } = render(<LoginFooter />)
    expect(screen.getByTestId('register-link'))
      .toHaveAttribute('href', '/auth/register')
    rerender(<LoginFooter tenant="a b" />)
    expect(screen.getByTestId('register-link'))
      .toHaveAttribute('href', '/auth/register?tenant=a%20b')
  })

  it('links to login with and without a tenant', () => {
    const { rerender } = render(<RegisterFooter />)
    expect(screen.getByTestId('login-link'))
      .toHaveAttribute('href', '/auth/login')
    rerender(<RegisterFooter tenant="x" />)
    expect(screen.getByTestId('login-link'))
      .toHaveAttribute('href', '/auth/login?tenant=x')
  })
})

describe('TurboErrorDialog', () => {
  it('shows message, closes and opens the vault', () => {
    const onClose = jest.fn()
    const open = jest.spyOn(window, 'open').mockImplementation(() => null)
    render(<TurboErrorDialog open message="Boom" onClose={onClose} />)
    expect(screen.getByText('Boom')).toBeInTheDocument()
    fireEvent.click(screen.getByText('Close'))
    expect(onClose).toHaveBeenCalled()
    fireEvent.click(screen.getByText('Open Vault'))
    expect(open).toHaveBeenCalledWith('https://vault.wardcrew.com', '_blank')
    open.mockRestore()
  })
})
