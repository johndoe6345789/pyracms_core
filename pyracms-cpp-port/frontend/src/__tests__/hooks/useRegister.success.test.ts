/** useRegister: successful registration. */
import {
  fill,
  mockApi,
  MOCK_USER,
  renderRegister,
  submit,
} from '../helpers/useRegisterHelpers'

const mockPush = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}))

jest.mock('@/lib/api', () => ({
  __esModule: true,
  default: { post: jest.fn() },
}))

describe('useRegister', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    localStorage.clear()
  })

  it('successful registration stores token in localStorage', async () => {
    mockApi.post.mockResolvedValueOnce({
      data: { token: 'regTok1', user: MOCK_USER },
    })
    const { result } = renderRegister()
    fill(result)
    await submit(result)
    expect(localStorage.getItem('token')).toBe('regTok1')
  })

  it('successful registration dispatches setCredentials', async () => {
    mockApi.post.mockResolvedValueOnce({
      data: { token: 'regTok1', user: MOCK_USER },
    })
    const { store, result } = renderRegister()
    fill(result)
    await submit(result)
    const auth = (
      store.getState() as { auth: { token: string } }
    ).auth
    expect(auth.token).toBe('regTok1')
  })

  it('navigates to default "/" path on success', async () => {
    mockApi.post.mockResolvedValueOnce({
      data: { token: 'regTok2', user: MOCK_USER },
    })
    const { result } = renderRegister()
    fill(result)
    await submit(result)
    expect(mockPush).toHaveBeenCalledWith('/')
  })

  it('navigates to a custom redirectTo on success', async () => {
    mockApi.post.mockResolvedValueOnce({
      data: { token: 'regTok3', user: MOCK_USER },
    })
    const { result } = renderRegister('/welcome')
    fill(result)
    await submit(result)
    expect(mockPush).toHaveBeenCalledWith('/welcome')
  })

  it('successful registration clears any previous error', async () => {
    const { result } = renderRegister()
    await submit(result)
    expect(result.current.error).toBeTruthy()
    mockApi.post.mockResolvedValueOnce({
      data: { token: 'tok', user: MOCK_USER },
    })
    fill(result)
    await submit(result)
    expect(result.current.error).toBe('')
  })
})
