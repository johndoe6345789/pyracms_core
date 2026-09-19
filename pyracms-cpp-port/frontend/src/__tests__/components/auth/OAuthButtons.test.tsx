import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import OAuthButtons from '@/components/auth/OAuthButtons'
import api from '@/lib/api'

jest.mock('@/lib/api', () => ({
  __esModule: true,
  default: { get: jest.fn() },
}))
const get = api.get as jest.Mock
const assign = jest.fn()
jest.mock('@/lib/navigate', () => ({ goTo: (u: string) => assign(u) }))

describe('OAuthButtons', () => {
  beforeEach(() => {
    get.mockReset()
    assign.mockReset()
    sessionStorage.clear()
  })

  it('renders nothing when no provider is configured', async () => {
    get.mockRejectedValue(new Error('400'))
    const { container } = render(<OAuthButtons />)
    await waitFor(() => expect(get).toHaveBeenCalledTimes(3))
    expect(container).toBeEmptyDOMElement()
  })

  it('redirects to the provider with a fresh state', async () => {
    get.mockResolvedValue({ data: { url: 'https://gh.test/auth' } })
    render(<OAuthButtons redirectTo="/site/x" />)
    fireEvent.click(await screen.findByTestId('oauth-github'))
    await waitFor(() =>
      expect(assign).toHaveBeenCalledWith('https://gh.test/auth'),
    )
    expect(JSON.parse(sessionStorage.getItem('oauth:pending')!)).toEqual({
      provider: 'github',
      redirectTo: '/site/x',
    })
  })

  it('shows an error when the provider url is unusable', async () => {
    get
      .mockResolvedValueOnce({ data: { url: 'https://ok' } })
      .mockRejectedValueOnce(new Error('x'))
      .mockRejectedValueOnce(new Error('x'))
    get.mockResolvedValue({ data: { url: 'javascript:1' } })
    render(<OAuthButtons />)
    fireEvent.click(await screen.findByTestId('oauth-github'))
    expect(await screen.findByTestId('oauth-error')).toBeInTheDocument()
    expect(assign).not.toHaveBeenCalled()
  })
})
