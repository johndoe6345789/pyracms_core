import {
  render, screen, fireEvent, waitFor,
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

const realLocation = window.location
beforeAll(() => {
  Object.defineProperty(window, 'location', {
    configurable: true, value: { set href(_v: string) {} },
  })
})
afterAll(() => {
  Object.defineProperty(window, 'location', {
    configurable: true, value: realLocation,
  })
})
beforeEach(() => {
  localStorage.clear()
  mobile = false
  get.mockImplementation((url: string) => Promise.resolve(
    url.includes('limit')
      ? { data: [{ name: 'a', displayName: 'Alpha' }] }
      : { data: { name: 'a', displayName: 'Alpha', revisions: [
        { version: '1.0', published: true, date: '2024-01-01' }] } }))
})

describe('GameLibrary install flow', () => {
  it('installs, shows and dismisses the notice, then clears the mark',
    async () => {
      render(<GameLibrary slug="s" initialName="a" />)
      const primary = await screen.findByTestId('game-actions')
      fireEvent.click(primary.querySelector('button')!)
      const clear = await screen.findByText('Clear mark')
      fireEvent.keyDown(document.body, { key: 'Escape' })
      fireEvent.click(clear)
      await waitFor(() => expect(screen.queryByText('Clear mark'))
        .toBeNull())
    })

  it('closes the mobile drawer with Escape', async () => {
    mobile = true
    render(<GameLibrary slug="s" />)
    fireEvent.click(screen.getByLabelText('Open library'))
    const side = await screen.findByTestId('library-sidebar')
    fireEvent.keyDown(side, { key: 'Escape' })
    await waitFor(() => expect(screen.queryByTestId('library-sidebar'))
      .toBeNull())
  })
})
