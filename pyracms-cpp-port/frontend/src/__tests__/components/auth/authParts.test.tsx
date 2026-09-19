import { render, screen, fireEvent } from '@testing-library/react'
import LoginActions from '@/components/auth/LoginActions'
import LoginFooter from '@/components/auth/LoginFooter'
import RegisterFooter from '@/components/auth/RegisterFooter'
import TurboErrorDialog from '@/components/auth/TurboErrorDialog'
import AuthScopeNotice from '@/components/auth/AuthScopeNotice'
import PasswordStrengthBar from '@/components/auth/PasswordStrengthBar'
import PasswordField from '@/components/auth/PasswordField'

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
    expect(open).toHaveBeenCalledWith(
      'https://vault.wardcrew.com', '_blank', 'noopener,noreferrer')
    open.mockRestore()
  })
})

describe('AuthScopeNotice', () => {
  it('names the site and links to the platform page', () => {
    render(<AuthScopeNotice tenant="demo" platformHref="/auth/login" />)
    expect(screen.getByText('demo')).toBeInTheDocument()
    expect(screen.getByTestId('platform-account-link'))
      .toHaveAttribute('href', '/auth/login')
  })
})

describe('PasswordStrengthBar', () => {
  it('renders nothing when empty and a label otherwise', () => {
    const { rerender } = render(<PasswordStrengthBar password="" />)
    expect(screen.queryByTestId('password-strength')).toBeNull()
    rerender(<PasswordStrengthBar password="Abcdef12" />)
    expect(screen.getByTestId('password-strength-label'))
      .toHaveTextContent('Strong')
  })
})

describe('PasswordField', () => {
  it('toggles visibility and reports changes', () => {
    const onChange = jest.fn()
    render(<PasswordField value="x" onChange={onChange} sx={{ mb: 1 }} />)
    const input = screen.getByTestId('password-input')
    expect(input).toHaveAttribute('type', 'password')
    fireEvent.click(screen.getByTestId('toggle-password'))
    expect(input).toHaveAttribute('type', 'text')
    fireEvent.change(input, { target: { value: 'y' } })
    expect(onChange).toHaveBeenCalledWith('y')
  })
})
