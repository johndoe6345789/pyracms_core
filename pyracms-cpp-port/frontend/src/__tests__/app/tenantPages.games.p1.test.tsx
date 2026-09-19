import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import GamesPage from '@/app/site/[slug]/(tenant)/games/page'
import GamePage from '@/app/site/[slug]/(tenant)/games/[name]/page'
import EditGamePage from '@/app/site/[slug]/(tenant)/games/[name]/edit/page'
import api from '@/lib/api'
import { st } from '../helpers/tenantPagesMocks'

jest.mock('next/navigation', () =>
  require('../helpers/tenantPagesMocks').navMock(),
)

jest.mock('@/lib/api', () => require('../helpers/tenantPagesMocks').apiMock())

jest.mock('@/components/common/CommentSection', () =>
  require('../helpers/commentMock').commentSectionMock(),
)

jest.mock('@/components/launcher/GameLibrary', () =>
  require('../helpers/tenantPagesMocks').libMock(),
)

jest.mock('@/components/common/TenantBreadcrumbs', () =>
  require('../helpers/tenantPagesMocks').crumbsMock(),
)

jest.mock('@/hooks/useTenant', () =>
  require('../helpers/tenantPagesMocks').tenantMock(),
)

const put = api.put as jest.Mock

const push = st.push

describe('tenant pages', () => {
  beforeEach(() => {
    push.mockClear()
    put.mockReset()
  })

  it('games pages pass the slug and name', async () => {
    ;(api.get as jest.Mock).mockResolvedValue({ data: { id: 3, name: 'g' } })
    render(<GamesPage />)
    expect(screen.getByTestId('lib')).toHaveTextContent('demo:-')
    render(<GamePage />)
    expect(screen.getAllByTestId('lib')[1]).toHaveTextContent('demo:g')
    expect(await screen.findByTestId('comments-game-3')).toBeInTheDocument()
  })

  it('edit page saves and navigates', async () => {
    put.mockResolvedValue({})
    ;(api.get as jest.Mock).mockResolvedValue({
      data: {
        name: 'g',
        displayName: 'Real Game',
        description: 'd',
        tags: ['x'],
        revisions: [],
      },
    })
    render(<EditGamePage />)
    fireEvent.click(await screen.findByText('Save Changes'))
    await waitFor(() => expect(push).toHaveBeenCalledWith('/site/demo/games/g'))
    expect(put.mock.calls[0]).toEqual([
      '/api/gamedep/game/g',
      { displayName: 'Real Game', description: 'd' },
    ])
    expect(put.mock.calls[1]).toEqual([
      '/api/gamedep/game/g/tags',
      { tags: ['x'] },
    ])
  })
})
