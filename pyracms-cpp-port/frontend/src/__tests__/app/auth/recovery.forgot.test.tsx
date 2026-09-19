import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import api from '@/lib/api'
import ForgotPasswordForm from '@/components/auth/ForgotPasswordForm'
import { asMockApi } from '../../helpers/mockApi'
import { type } from '../../helpers/authType'

jest.mock('@/lib/api', () => ({
  __esModule: true,
  default: { post: jest.fn() },
}))
const m = asMockApi<'post'>(api)
beforeEach(() => m.post.mockReset())

describe('ForgotPasswordForm', () => {
  it('sends the reset request with the tenant', async () => {
    m.post.mockResolvedValue({})
    render(<ForgotPasswordForm tenant="demo" />)
    type('forgot-email', ' a@b.co ')
    fireEvent.submit(screen.getByTestId('forgot-form'))
    expect(await screen.findByTestId('forgot-done')).toBeInTheDocument()
    expect(m.post).toHaveBeenCalledWith('/api/auth/forgot-password',
      { email: 'a@b.co', tenant: 'demo' })
    expect(screen.getByTestId('forgot-back'))
      .toHaveAttribute('href', '/auth/login?tenant=demo')
  })
  it('shows API errors, platform scope has no tenant', async () => {
    m.post.mockRejectedValue({ response: { data: { error: 'Slow down' } } })
    render(<ForgotPasswordForm />)
    type('forgot-email', 'a@b.co')
    fireEvent.submit(screen.getByTestId('forgot-form'))
    expect(await screen.findByTestId('forgot-error'))
      .toHaveTextContent('Slow down')
    expect(m.post).toHaveBeenCalledWith('/api/auth/forgot-password',
      { email: 'a@b.co' })
  })
  it('rejects an empty email', () => {
    render(<ForgotPasswordForm />)
    fireEvent.submit(screen.getByTestId('forgot-form'))
    expect(screen.getByTestId('forgot-error')).toHaveTextContent('required')
    expect(m.post).not.toHaveBeenCalled()
  })
})
