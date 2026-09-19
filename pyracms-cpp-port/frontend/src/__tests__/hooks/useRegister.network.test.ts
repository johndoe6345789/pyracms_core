/** useRegister: network errors and the loading lifecycle. */
import {
  fill,
  mockApi,
  MOCK_USER,
  renderRegister,
  submit,
} from '../helpers/useRegisterHelpers'

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() }),
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

  it('sets "Unable to connect to server" on network error', async () => {
    mockApi.post.mockRejectedValueOnce(new Error('Network Error'))
    const { result } = renderRegister()
    fill(result)
    await submit(result)
    expect(result.current.error).toBe('Unable to connect to server')
  })

  it('sets "Unable to connect to server" when err is string', async () => {
    mockApi.post.mockRejectedValueOnce('timeout')
    const { result } = renderRegister()
    fill(result)
    await submit(result)
    expect(result.current.error).toBe('Unable to connect to server')
  })

  it('loading is false after successful request completes', async () => {
    mockApi.post.mockResolvedValueOnce({
      data: { token: 'tok', user: MOCK_USER },
    })
    const { result } = renderRegister()
    fill(result)
    await submit(result)
    expect(result.current.loading).toBe(false)
  })

  it('loading is false after failed request completes', async () => {
    mockApi.post.mockRejectedValueOnce(new Error('Network Error'))
    const { result } = renderRegister()
    fill(result)
    await submit(result)
    expect(result.current.loading).toBe(false)
  })

  it('loading is false after server-side error (no token)', async () => {
    mockApi.post.mockResolvedValueOnce({
      data: { error: 'Taken' },
    })
    const { result } = renderRegister()
    fill(result)
    await submit(result)
    expect(result.current.loading).toBe(false)
  })
})
