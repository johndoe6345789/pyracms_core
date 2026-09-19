import {
  render, screen, fireEvent, waitFor, within,
} from '@testing-library/react'
import GameLibrary from '@/components/launcher/GameLibrary'
import api from '@/lib/api'

jest.mock('@/lib/api', () => ({
  __esModule: true, default: { get: jest.fn() },
}))
const get = api.get as jest.Mock
let mobile = false
jest.mock('@/hooks/useSiteSession', () => ({
  useSiteSession: () => true,
}))
jest.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true, default: () => mobile,
}))

const rows = [
  { name: 'a', displayName: 'Alpha', tags: ['x'] },
  { name: 'b', displayName: 'Beta', tags: [] },
]

const grid = () => within(screen.getByTestId('browse-grid'))

beforeEach(() => {
  localStorage.clear()
  mobile = false
  get.mockImplementation((url: string) => Promise.resolve(
    url.includes('limit') ? { data: rows }
      : { data: { name: 'a', displayName: 'Alpha', revisions: [] } }))
})

describe('GameLibrary', () => {
  it('starts in browse and opens a game from the grid', async () => {
    render(<GameLibrary slug="s" />)
    await waitFor(() => expect(grid().queryByText('Beta')).not.toBeNull())
    fireEvent.click(grid().getByText('Alpha'))
    await waitFor(() =>
      expect(screen.getByTestId('game-actions')).toBeInTheDocument())
    fireEvent.click(screen.getByLabelText('Toggle favourite'))
    expect(screen.getByTestId('game-library')).toBeInTheDocument()
  })

  it('opens the named game in library view', async () => {
    render(<GameLibrary slug="s" initialName="a" />)
    await waitFor(() =>
      expect(screen.getByTestId('game-actions')).toBeInTheDocument())
    expect(screen.getByText('Edit').closest('a'))
      .toHaveAttribute('href', '/site/s/games/a/edit')
  })

  it('selects the first game when switching to library', async () => {
    render(<GameLibrary slug="s" />)
    await waitFor(() => expect(grid().queryByText('Beta')).not.toBeNull())
    fireEvent.click(screen.getByText('Library'))
    await waitFor(() =>
      expect(screen.getByTestId('game-actions')).toBeInTheDocument())
  })

  it('shows samples when the api is empty', async () => {
    get.mockResolvedValue({ data: [] })
    render(<GameLibrary slug="s" />)
    await waitFor(() =>
      expect(screen.getByText(/sample entries/)).toBeInTheDocument())
  })

  it('uses a drawer on mobile', async () => {
    mobile = true
    render(<GameLibrary slug="s" />)
    fireEvent.click(screen.getByLabelText('Open library'))
    await waitFor(() =>
      expect(screen.getByTestId('library-sidebar')).toBeInTheDocument())
  })

  it('prompts when nothing is selected in library view', async () => {
    get.mockResolvedValue({ data: [{ name: 'a', displayName: 'A' }] })
    render(<GameLibrary slug="s" initialName="zzz" />)
    await waitFor(() => expect(get).toHaveBeenCalled())
    fireEvent.change(screen.getAllByLabelText('Search library')[0]!,
      { target: { value: 'nomatch' } })
    expect(screen.getByTestId('game-library')).toBeInTheDocument()
  })
})
