import { screen, waitFor, fireEvent, within } from '@testing-library/react'
import { renderWithStore } from '../../helpers/renderWithStore'
import LoginPage from '@/app/auth/login/page'

const push = jest.fn()
let query = ''
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push }),
  useSearchParams: () => new URLSearchParams(query),
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

const login = () => {
  fireEvent.change(screen.getByTestId('username-input'), {
    target: { value: 'sam' },
  })
  fireEvent.change(screen.getByTestId('password-input'), {
    target: { value: 'password123' },
  })
  fireEvent.submit(screen.getByTestId('login-form'))
}
const pick = async (name: RegExp) => {
  fireEvent.mouseDown(
    within(screen.getByTestId('login-scope')).getByRole('combobox'),
  )
  fireEvent.click(await screen.findByRole('option', { name }))
}

beforeEach(() => {
  jest.clearAllMocks()
  query = ''
  get.mockResolvedValue({
    data: [{ slug: 'alpha', displayName: 'Alpha' }, { slug: 'beta' }],
  })
  post.mockResolvedValue({ data: { token: 't', user: { id: 1 } } })
})

describe('login page redirects', () => {
  it('signs the Platform Owner in and returns to the homepage', async () => {
    renderWithStore(<LoginPage />)
    await screen.findByTestId('login-scope')
    login()
    await waitFor(() => expect(push).toHaveBeenCalledWith('/'))
    expect(post).toHaveBeenCalledWith('/api/auth/login', {
      username: 'sam',
      password: 'password123',
    })
  })

  it('signs a site user in to that site and redirects there', async () => {
    renderWithStore(<LoginPage />)
    await pick(/Alpha/)
    login()
    await waitFor(() => expect(push).toHaveBeenCalledWith('/site/alpha'))
    expect(post).toHaveBeenCalledWith('/api/auth/login', {
      username: 'sam',
      password: 'password123',
      tenant: 'alpha',
    })
  })

  it('starts on the site named in the link and honours ?redirect', async () => {
    query = 'tenant=beta&redirect=/site/beta/forum'
    renderWithStore(<LoginPage />)
    await screen.findByTestId('login-scope')
    login()
    await waitFor(() => expect(push).toHaveBeenCalledWith('/site/beta/forum'))
  })
})
