/** useRegister: server error responses and axios errors. */
import {
  fill,
  mockApi,
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

  it('sets error from response.data.error when token absent', async () => {
    mockApi.post.mockResolvedValueOnce({
      data: { error: 'Username already taken' },
    })
    const { result } = renderRegister()
    fill(result)
    await submit(result)
    expect(result.current.error).toBe('Username already taken')
  })

  it('falls back to "Registration failed" when no error msg', async () => {
    mockApi.post.mockResolvedValueOnce({ data: {} })
    const { result } = renderRegister()
    fill(result)
    await submit(result)
    expect(result.current.error).toBe('Registration failed')
  })

  it('does not navigate when token is absent', async () => {
    mockApi.post.mockResolvedValueOnce({ data: {} })
    const { result } = renderRegister()
    fill(result)
    await submit(result)
    expect(mockPush).not.toHaveBeenCalled()
  })

  it('sets server error message from caught axios error', async () => {
    mockApi.post.mockRejectedValueOnce({
      response: {
        data: { error: 'Email already registered' },
      },
    })
    const { result } = renderRegister()
    fill(result)
    await submit(result)
    expect(result.current.error).toBe('Email already registered')
  })

  it('falls back to "Registration failed" on axios err', async () => {
    mockApi.post.mockRejectedValueOnce({
      response: { data: {} },
    })
    const { result } = renderRegister()
    fill(result)
    await submit(result)
    expect(result.current.error).toBe('Registration failed')
  })
})
