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

describe('useLogin – redirect and error reset', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    localStorage.clear()
  })

  it('successful login navigates to default "/" path', async () => {
    okResponse('tok123')
    const { result } = renderLogin()
    fillForm(result)
    await submitForm(result)
    expect(mockPush).toHaveBeenCalledWith('/')
  })

  it('successful login navigates to a custom redirectTo path', async () => {
    okResponse('tok456')
    const { result } = renderLogin('/dashboard')
    fillForm(result)
    await submitForm(result)
    expect(mockPush).toHaveBeenCalledWith('/dashboard')
  })

  it('successful login clears any previous error', async () => {
    // First trigger a validation error, then supply valid
    // data and a successful response.
    const { result } = renderLogin()
    await submitForm(result)
    expect(result.current.error).toBeTruthy()

    okResponse('tok789')
    fillForm(result)
    await submitForm(result)
    expect(result.current.error).toBe('')
  })
})
