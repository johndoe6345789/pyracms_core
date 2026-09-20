import { screen, fireEvent, within } from '@testing-library/react'
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

beforeEach(() => {
  jest.clearAllMocks()
  query = ''
  get.mockResolvedValue({
    data: [{ slug: 'alpha', displayName: 'Alpha' }, { slug: 'beta' }],
  })
  post.mockResolvedValue({ data: { token: 't', user: { id: 1 } } })
})

describe('login page site picker', () => {
  it('lists the Platform Owner and every site', async () => {
    renderWithStore(<LoginPage />)
    fireEvent.mouseDown(
      within(await screen.findByTestId('login-scope')).getByRole('combobox'),
    )
    const names = (await screen.findAllByRole('option')).map(
      (o) => o.textContent,
    )
    expect(names).toEqual(['Platform Owner', 'Alpha (alpha)', 'beta (beta)'])
  })
})
