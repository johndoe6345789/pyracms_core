import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import api from '@/lib/api'
import ResetPasswordForm from '@/components/auth/ResetPasswordForm'
import VerifyEmailStatus from '@/components/auth/VerifyEmailStatus'
import { asMockApi } from '../../helpers/mockApi'
import { type } from '../../helpers/authType'

jest.mock('@/lib/api', () => ({
  __esModule: true,
  default: { post: jest.fn() },
}))
const m = asMockApi<'post'>(api)
beforeEach(() => m.post.mockReset())

describe('ResetPasswordForm', () => {
  const submit = () => fireEvent.submit(screen.getByTestId('reset-form'))
  it('validates then posts the token and password', async () => {
    m.post.mockResolvedValue({})
    render(<ResetPasswordForm token="tok" />)
    type('reset-password', 'short')
    type('reset-confirm', 'short')
    submit()
    expect(screen.getByTestId('reset-error')).toHaveTextContent('8 char')
    type('reset-password', 'longenough1')
    type('reset-confirm', 'different1')
    submit()
    expect(screen.getByTestId('reset-error')).toHaveTextContent('match')
    type('reset-confirm', 'longenough1')
    submit()
    expect(await screen.findByTestId('reset-done')).toBeInTheDocument()
    expect(m.post).toHaveBeenCalledWith('/api/auth/reset-password',
      { token: 'tok', password: 'longenough1' })
  })
  it('needs a token and reports invalid ones', async () => {
    const { unmount } = render(<ResetPasswordForm token="" />)
    submit()
    expect(screen.getByTestId('reset-error')).toHaveTextContent('token')
    unmount()
    m.post.mockRejectedValue({
      response: { data: { error: 'Invalid or expired token' } },
    })
    render(<ResetPasswordForm token="x" />)
    type('reset-password', 'longenough1')
    type('reset-confirm', 'longenough1')
    submit()
    expect(await screen.findByTestId('reset-error'))
      .toHaveTextContent('Invalid or expired')
  })
})

describe('VerifyEmailStatus', () => {
  it('verifies the token', async () => {
    m.post.mockResolvedValue({})
    render(<VerifyEmailStatus token="t" />)
    expect(screen.getByTestId('verify-pending')).toBeInTheDocument()
    expect(await screen.findByTestId('verify-ok')).toBeInTheDocument()
    expect(m.post).toHaveBeenCalledWith(
      '/api/auth/verify-email', { token: 't' })
  })
  it('reports failure and a missing token', async () => {
    m.post.mockRejectedValue({ response: { data: { error: 'Expired' } } })
    const { unmount } = render(<VerifyEmailStatus token="t" />)
    await waitFor(() => expect(screen.getByTestId('verify-error'))
      .toHaveTextContent('Expired'))
    unmount()
    render(<VerifyEmailStatus token="" />)
    expect(screen.getByTestId('verify-error')).toHaveTextContent('missing')
  })
})
