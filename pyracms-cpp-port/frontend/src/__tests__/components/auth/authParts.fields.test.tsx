import { render, screen, fireEvent } from '@testing-library/react'
import AuthScopeNotice from '@/components/auth/AuthScopeNotice'
import PasswordStrengthBar from '@/components/auth/PasswordStrengthBar'
import PasswordField from '@/components/auth/PasswordField'

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
