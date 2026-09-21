import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import NewGamePage from '@/app/site/[slug]/(tenant)/games/new/page'
import LibraryHeader from '@/components/launcher/LibraryHeader'
import api from '@/lib/api'
import { typeInto as type } from '../helpers/typeInto'

const push = jest.fn()

jest.mock('@/hooks/useTenantId', () => ({
  useTenantId: () => ({ tenantId: 7, loading: false }),
}))
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
  it('rejects bad names and shows API errors', async () => {
    render(<NewGamePage />)
    type('gd-name', 'bad name!')
    fireEvent.submit(screen.getByTestId('gamedep-create'))
    expect(screen.getByTestId('create-error')).toHaveTextContent('Name may')
    expect(post).not.toHaveBeenCalled()
    post.mockRejectedValue({ response: { data: { error: 'Exists' } } })
    type('gd-name', 'ok')
    fireEvent.submit(screen.getByTestId('gamedep-create'))
    await waitFor(() =>
      expect(screen.getByTestId('create-error')).toHaveTextContent('Exists'),
    )
  })
  it('library header shows New game only when given a link', () => {
    const p = {
      search: '',
      onSearch: jest.fn(),
      filter: 'all' as const,
      onFilter: jest.fn(),
      tags: [],
      tag: '',
      onTag: jest.fn(),
    }
    const { rerender } = render(<LibraryHeader {...p} />)
    expect(screen.queryByTestId('new-game-btn')).toBeNull()
    rerender(<LibraryHeader {...p} newHref="/site/s/games/new" />)
    expect(screen.getByTestId('new-game-btn')).toHaveAttribute(
      'href',
      '/site/s/games/new',
    )
  })
})
