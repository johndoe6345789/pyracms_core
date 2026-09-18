import { render, screen, waitFor } from '@testing-library/react'
import AdminRedirect from '@/app/admin/page'
import api from '@/lib/api'

const replace = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: () => ({ replace }),
}))
jest.mock('@/lib/api', () => ({
  __esModule: true,
  default: { get: jest.fn() },
}))

describe('admin redirect', () => {
  it('redirects to first tenant', async () => {
    ;(api.get as jest.Mock).mockResolvedValue({
      data: [{ slug: 't1' }],
    })
    render(<AdminRedirect />)
    await waitFor(() =>
      expect(replace).toHaveBeenCalledWith('/site/t1/admin'),
    )
  })

  it('shows empty and failure errors', async () => {
    ;(api.get as jest.Mock).mockResolvedValueOnce({ data: [] })
    const { unmount } = render(<AdminRedirect />)
    expect(await screen.findByText(/No tenants found/))
      .toBeInTheDocument()
    unmount()
    ;(api.get as jest.Mock).mockRejectedValueOnce(new Error('x'))
    render(<AdminRedirect />)
    expect(await screen.findByText('Failed to load tenants'))
      .toBeInTheDocument()
  })
})
