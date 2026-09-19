import api from '@/lib/api'
import { asMockApi } from '../helpers/mockApi'
import {
  MOCK_USER,
  fillForm,
  renderLogin,
  submitForm,
} from '../helpers/loginHookHelpers'

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() }),
}))

jest.mock('@/lib/api', () => ({
  __esModule: true,
  default: { post: jest.fn() },
}))

const mockApi = asMockApi<'post'>(api)

describe('useLogin – loading and API shape', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    localStorage.clear()
  })

  it('loading is false after a successful request completes', async () => {
    mockApi.post.mockResolvedValueOnce({
      data: { token: 'tok123', user: MOCK_USER },
    })
    const { result } = renderLogin()
    fillForm(result)
    await submitForm(result)
    expect(result.current.loading).toBe(false)
  })

  it('loading is false after a failed request completes', async () => {
    mockApi.post.mockRejectedValueOnce(new Error('Network Error'))
    const { result } = renderLogin()
    fillForm(result)
    await submitForm(result)
    expect(result.current.loading).toBe(false)
  })

  it('loading is false after a server-side error (no token)', async () => {
    mockApi.post.mockResolvedValueOnce({
      data: { error: 'Bad creds' },
    })
    const { result } = renderLogin()
    fillForm(result)
    await submitForm(result)
    expect(result.current.loading).toBe(false)
  })

  it('calls POST /api/auth/login with the form data', async () => {
    mockApi.post.mockResolvedValueOnce({
      data: { token: 'tok', user: MOCK_USER },
    })
    const { result } = renderLogin()
    fillForm(result, 'alice', 'pass123')
    await submitForm(result)
    expect(mockApi.post).toHaveBeenCalledWith('/api/auth/login', {
      username: 'alice',
      password: 'pass123',
    })
  })
})
