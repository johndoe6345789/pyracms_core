import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import GameLibrary from '@/components/launcher/GameLibrary'
import api from '@/lib/api'
import { okGet } from '../../helpers/gameLibrarySetup'

jest.mock('@/lib/api', () => ({
  __esModule: true,
  default: { get: jest.fn() },
}))
const get = api.get as jest.Mock
let mobile = false
jest.mock('@/hooks/useSiteSession', () => ({
  useSiteSession: () => true,
}))
jest.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: () => mobile,
}))

beforeEach(() => {
  localStorage.clear()
  mobile = false
  get.mockImplementation(okGet)
})

describe('GameLibrary', () => {
  it('shows an empty state when the api is empty', async () => {
    get.mockResolvedValue({ data: [] })
    render(<GameLibrary slug="s" />)
    await waitFor(() =>
      expect(screen.getAllByText('No games match.').length).toBeGreaterThan(0),
    )
  })

  it('shows an empty hint when the search matches nothing', async () => {
    get.mockResolvedValue({ data: [{ name: 'a', displayName: 'A' }] })
    render(<GameLibrary slug="s" />)
    await waitFor(() => expect(get).toHaveBeenCalled())
    fireEvent.change(screen.getByLabelText('Search games'), {
      target: { value: 'nomatch' },
    })
    expect(await screen.findByText('No games match.')).toBeInTheDocument()
  })
})
