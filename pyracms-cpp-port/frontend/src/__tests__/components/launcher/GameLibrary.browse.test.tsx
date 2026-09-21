import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import GameLibrary from '@/components/launcher/GameLibrary'
import api from '@/lib/api'
import { grid, okGet } from '../../helpers/gameLibrarySetup'

jest.mock('@/lib/api', () => ({
  __esModule: true,
  default: { get: jest.fn() },
}))
const get = api.get as jest.Mock
jest.mock('@/hooks/useSiteSession', () => ({
  useSiteSession: () => true,
}))
jest.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: () => false,
}))

beforeEach(() => {
  localStorage.clear()
  get.mockImplementation(okGet)
})

describe('GameLibrary', () => {
  it('starts in browse and opens a game from the grid', async () => {
    render(<GameLibrary slug="s" />)
    await waitFor(() => expect(grid().queryByText('Beta')).not.toBeNull())
    fireEvent.click(grid().getByText('Alpha'))
    await waitFor(() =>
      expect(screen.getByTestId('game-actions')).toBeInTheDocument(),
    )
    fireEvent.click(screen.getByLabelText('Toggle favourite'))
    expect(screen.getByTestId('game-library')).toBeInTheDocument()
  })

  it('opens the named game in library view', async () => {
    render(<GameLibrary slug="s" initialName="a" />)
    await waitFor(() =>
      expect(screen.getByTestId('game-actions')).toBeInTheDocument(),
    )
    expect(screen.getByText('Edit').closest('a')).toHaveAttribute(
      'href',
      '/site/s/games/a/edit',
    )
  })

  it('opens a game from the grid', async () => {
    render(<GameLibrary slug="s" />)
    await waitFor(() => expect(grid().queryByText('Beta')).not.toBeNull())
    fireEvent.click(grid().getByText('Beta'))
    await waitFor(() =>
      expect(screen.getByTestId('game-actions')).toBeInTheDocument(),
    )
  })
})
