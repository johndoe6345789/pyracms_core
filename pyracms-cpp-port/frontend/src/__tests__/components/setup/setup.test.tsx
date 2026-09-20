import { screen, waitFor, fireEvent } from '@testing-library/react'
import { renderWithStore } from '../../helpers/renderWithStore'
import SetupRedirect from '@/components/portal/SetupRedirect'
import SetupPage from '@/app/setup/page'

const replace = jest.fn()
const push = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: () => ({ replace, push }),
}))
const get = jest.fn()
const post = jest.fn()
jest.mock('@/lib/api', () => ({
  __esModule: true,
  default: {
    get: (...a: unknown[]) => get(...a),
    post: (...a: unknown[]) => post(...a),
  },
}))

beforeEach(() => jest.clearAllMocks())

describe('SetupRedirect', () => {
  it('sends visitors to /setup while the platform has no owner', async () => {
    get.mockResolvedValue({ data: { needsSetup: true } })
    renderWithStore(<SetupRedirect />)
    await waitFor(() => expect(replace).toHaveBeenCalledWith('/setup'))
  })

  it('leaves visitors alone once set up, or if the check fails', async () => {
    get.mockResolvedValue({ data: { needsSetup: false } })
    renderWithStore(<SetupRedirect />)
    get.mockRejectedValue(new Error('down'))
    renderWithStore(<SetupRedirect />)
    await new Promise((r) => setTimeout(r, 20))
    expect(replace).not.toHaveBeenCalled()
  })
})

describe('setup page', () => {
  it('shows the form and creates the Platform Owner', async () => {
    get.mockResolvedValue({ data: { needsSetup: true } })
    post.mockResolvedValue({
      data: { token: 't', user: { id: 1, username: 'boss', role: 4 } },
    })
    renderWithStore(<SetupPage />)
    const form = await screen.findByTestId('setup-form')
    const set = (label: RegExp, v: string) =>
      fireEvent.change(screen.getAllByLabelText(label)[0]!, {
        target: { value: v },
      })
    set(/username/i, 'boss')
    set(/email/i, 'boss@x.io')
    set(/^password/i, 'password123')
    set(/confirm/i, 'password123')
    fireEvent.submit(form)
    await waitFor(() => expect(push).toHaveBeenCalledWith('/'))
    expect(post).toHaveBeenCalledWith('/api/auth/setup', {
      username: 'boss',
      email: 'boss@x.io',
      password: 'password123',
    })
  })

  it('validates before posting', async () => {
    get.mockResolvedValue({ data: { needsSetup: true } })
    renderWithStore(<SetupPage />)
    fireEvent.submit(await screen.findByTestId('setup-form'))
    expect(await screen.findByTestId('setup-error')).toBeInTheDocument()
    expect(post).not.toHaveBeenCalled()
  })

  it('leads home when setup is already done', async () => {
    get.mockResolvedValue({ data: { needsSetup: false } })
    renderWithStore(<SetupPage />)
    await waitFor(() => expect(replace).toHaveBeenCalledWith('/'))
    expect(screen.queryByTestId('setup-form')).toBeNull()
  })
})
