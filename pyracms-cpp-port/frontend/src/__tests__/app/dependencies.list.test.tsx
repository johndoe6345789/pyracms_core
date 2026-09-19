import { render, screen, fireEvent } from '@testing-library/react'
import DepsPage from '@/app/site/[slug]/(tenant)/dependencies/page'
import api from '@/lib/api'
import { depRow as row } from '../helpers/depsPage'

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() }),
  useParams: () => ({ slug: 's', name: 'sdl2' }),
}))
jest.mock('@/lib/api', () => ({
  __esModule: true,
  default: { get: jest.fn(), put: jest.fn() },
}))
let signedIn = true
jest.mock('@/hooks/useSiteSession', () => ({
  useSiteSession: () => signedIn,
}))
const get = api.get as jest.Mock
beforeEach(() => {
  get.mockReset()
  signedIn = true
})

describe('dependencies list page', () => {
  it('lists real dependencies and filters them', async () => {
    get.mockResolvedValue({ data: [row] })
    render(<DepsPage />)
    expect(await screen.findByText('SDL2')).toBeInTheDocument()
    expect(get).toHaveBeenCalledWith('/api/gamedep/dep?limit=100')
    expect(screen.getByTestId('new-dep-btn')).toHaveAttribute(
      'href',
      '/site/s/dependencies/new',
    )
    fireEvent.change(screen.getByPlaceholderText('Search dependencies...'), {
      target: { value: 'zzzz-nothing' },
    })
    expect(screen.queryByText('SDL2')).toBeNull()
  })
  it('offers a call to action when empty, none for guests', async () => {
    get.mockResolvedValue({ data: [] })
    const { unmount } = render(<DepsPage />)
    expect(await screen.findByTestId('deps-empty')).toHaveTextContent(
      'create the first',
    )
    unmount()
    signedIn = false
    render(<DepsPage />)
    expect(await screen.findByTestId('deps-empty')).toHaveTextContent(
      'published yet',
    )
    expect(screen.queryByTestId('new-dep-btn')).toBeNull()
  })
  it('shows a load error', async () => {
    get.mockRejectedValue(new Error('x'))
    render(<DepsPage />)
    expect(
      await screen.findByText('Could not load the list.'),
    ).toBeInTheDocument()
  })
})
