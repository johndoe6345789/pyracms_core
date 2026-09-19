import api from '@/lib/api'
import { asMockApi } from '../helpers/mockApi'
import {
  MOCK_USER,
  fillForm,
  renderLogin,
  submitForm,
} from '../helpers/loginHookHelpers'

const mockPush = jest.fn()

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}))

jest.mock('@/lib/api', () => ({
  __esModule: true,
  default: { post: jest.fn() },
}))

const mockApi = asMockApi<'post'>(api)

function okResponse(token: string) {
  mockApi.post.mockResolvedValueOnce({
    data: { token, user: MOCK_USER },
  })
}

describe('useLogin – successful login', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    localStorage.clear()
  })

  it('successful login stores token in localStorage', async () => {
    okResponse('tok123')
    const { result } = renderLogin()
    fillForm(result)
    await submitForm(result)
    expect(localStorage.getItem('token')).toBe('tok123')
  })

  it('successful login dispatches setCredentials to the store', async () => {
    okResponse('tok123')
    const { store, result } = renderLogin()
    fillForm(result)
    await submitForm(result)
    const auth = (store.getState() as { auth: { token: string } }).auth
    expect(auth.token).toBe('tok123')
  })
})
