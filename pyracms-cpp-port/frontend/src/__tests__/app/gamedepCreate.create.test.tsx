import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import NewGamePage from '@/app/site/[slug]/(tenant)/games/new/page'
import NewDepPage from '@/app/site/[slug]/(tenant)/dependencies/new/page'
import api from '@/lib/api'
import { typeInto as type } from '../helpers/typeInto'

const push = jest.fn()

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push }),
  useParams: () => ({ slug: 's' }),
}))

jest.mock('@/lib/api', () => ({
  __esModule: true,
  default: { post: jest.fn() },
}))

const post = api.post as jest.Mock

beforeEach(() => {
  push.mockReset()
  post.mockReset()
})

describe('create game / dependency pages', () => {
  it('creates a game and opens it', async () => {
    post.mockResolvedValue({ data: { id: 1 } })
    render(<NewGamePage />)
    type('gd-name', ' my-game ')
    type('gd-description', 'fun')
    fireEvent.submit(screen.getByTestId('gamedep-create'))
    await waitFor(() =>
      expect(push).toHaveBeenCalledWith('/site/s/games/my-game'),
    )
    expect(post).toHaveBeenCalledWith('/api/gamedep/game', {
      name: 'my-game',
      displayName: 'my-game',
      description: 'fun',
    })
  })
  it('creates a dependency with a display name', async () => {
    post.mockResolvedValue({ data: {} })
    render(<NewDepPage />)
    type('gd-name', 'sdl2')
    type('gd-display', 'SDL 2')
    fireEvent.submit(screen.getByTestId('gamedep-create'))
    await waitFor(() =>
      expect(push).toHaveBeenCalledWith('/site/s/dependencies/sdl2'),
    )
    expect(post.mock.calls[0]).toEqual([
      '/api/gamedep/dep',
      { name: 'sdl2', displayName: 'SDL 2', description: '' },
    ])
  })
})
