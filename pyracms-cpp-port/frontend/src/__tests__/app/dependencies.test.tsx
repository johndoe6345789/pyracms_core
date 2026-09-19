import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import DepsPage from '@/app/site/[slug]/(tenant)/dependencies/page'
import DepPage from '@/app/site/[slug]/(tenant)/dependencies/[name]/page'
import EditDepPage
  from '@/app/site/[slug]/(tenant)/dependencies/[name]/edit/page'
import api from '@/lib/api'

const push = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push }),
  useParams: () => ({ slug: 's', name: 'sdl2' }),
}))
jest.mock('@/lib/api', () => ({
  __esModule: true, default: { get: jest.fn(), put: jest.fn() },
}))
let signedIn = true
jest.mock('@/hooks/useSiteSession', () => ({
  useSiteSession: () => signedIn,
}))
const get = api.get as jest.Mock
const put = api.put as jest.Mock
const row = {
  name: 'sdl2', displayName: 'SDL2', description: 'lib', tags: ['audio'],
  revisions: [{ version: '2.28.5', published: true, createdAt: '2024-01-02' }],
}
beforeEach(() => {
  push.mockReset(); put.mockReset(); get.mockReset(); signedIn = true
})

describe('dependencies list page', () => {
  it('lists real dependencies and filters them', async () => {
    get.mockResolvedValue({ data: [row] })
    render(<DepsPage />)
    expect(await screen.findByText('SDL2')).toBeInTheDocument()
    expect(get).toHaveBeenCalledWith('/api/gamedep/dep?limit=100')
    expect(screen.getByTestId('new-dep-btn'))
      .toHaveAttribute('href', '/site/s/dependencies/new')
    fireEvent.change(screen.getByPlaceholderText('Search dependencies...'),
      { target: { value: 'zzzz-nothing' } })
    expect(screen.queryByText('SDL2')).toBeNull()
  })
  it('offers a call to action when empty, none for guests', async () => {
    get.mockResolvedValue({ data: [] })
    const { unmount } = render(<DepsPage />)
    expect(await screen.findByTestId('deps-empty'))
      .toHaveTextContent('create the first')
    unmount()
    signedIn = false
    render(<DepsPage />)
    expect(await screen.findByTestId('deps-empty'))
      .toHaveTextContent('published yet')
    expect(screen.queryByTestId('new-dep-btn')).toBeNull()
  })
  it('shows a load error', async () => {
    get.mockRejectedValue(new Error('x'))
    render(<DepsPage />)
    expect(await screen.findByText('Could not load the list.'))
      .toBeInTheDocument()
  })
})

describe('dependency detail page', () => {
  it('loads the dependency and walks through the tabs', async () => {
    get.mockResolvedValue({ data: row })
    render(<DepPage />)
    expect(await screen.findByTestId('edit-button'))
      .toHaveAttribute('href', '/site/s/dependencies/sdl2/edit')
    expect(get).toHaveBeenCalledWith('/api/gamedep/dep/sdl2')
    expect(screen.getByText('2.28.5')).toBeInTheDocument()
    fireEvent.click(screen.getByTestId('tab-binaries'))
    fireEvent.click(screen.getByTestId('tab-dependencies'))
    fireEvent.click(screen.getByTestId('tab-screenshots'))
  })
  it('reports a missing dependency', async () => {
    get.mockRejectedValue(new Error('404'))
    render(<DepPage />)
    expect(await screen.findByTestId('item-not-found')).toBeInTheDocument()
  })
})

describe('dependency edit page', () => {
  it('saves page fields and tags, then returns to the detail', async () => {
    get.mockResolvedValue({ data: row })
    put.mockResolvedValue({})
    render(<EditDepPage />)
    expect(await screen.findByLabelText('Display Name')).toHaveValue('SDL2')
    fireEvent.change(screen.getByLabelText('Display Name'),
      { target: { value: 'SDL3' } })
    fireEvent.change(screen.getByPlaceholderText('Add tag...'),
      { target: { value: 'Fast' } })
    fireEvent.click(screen.getByText('Add'))
    fireEvent.click(screen.getByText('Save Changes'))
    await waitFor(() => expect(push).toHaveBeenCalledWith(
      '/site/s/dependencies/sdl2'))
    expect(put.mock.calls[0]).toEqual(['/api/gamedep/dep/sdl2',
      { displayName: 'SDL3', description: 'lib' }])
    expect(put.mock.calls[1][1].tags).toEqual(['audio', 'fast'])
  })

  it('shows the API error and stays put when saving fails', async () => {
    get.mockResolvedValue({ data: row })
    put.mockRejectedValue({ response: { data: { error: 'Forbidden' } } })
    render(<EditDepPage />)
    fireEvent.click(await screen.findByText('Save Changes'))
    expect(await screen.findByTestId('save-error'))
      .toHaveTextContent('Forbidden')
    expect(push).not.toHaveBeenCalled()
  })
})
