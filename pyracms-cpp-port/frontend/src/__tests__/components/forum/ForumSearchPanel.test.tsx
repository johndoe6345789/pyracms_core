import { render, screen, fireEvent } from '@testing-library/react'
import api from '@/lib/api'
import { ForumSearchPanel } from '@/components/forum/ForumSearchPanel'
import { asMockApi } from '../../helpers/mockApi'

const push = jest.fn()
jest.mock('next/navigation', () => ({ useRouter: () => ({ push }) }))
jest.mock('@/lib/api', () => ({
  __esModule: true,
  default: { get: jest.fn() },
}))
const mock = asMockApi<'get'>(api)

const search = async () => {
  render(<ForumSearchPanel slug="s" tenantId={3} forums={['A']} />)
  const input = screen.getByTestId('forum-search-input').querySelector('input')!
  fireEvent.change(input, { target: { value: 'hi' } })
  fireEvent.keyDown(input, { key: 'Enter' })
}

beforeEach(() => { push.mockReset(); mock.get.mockReset() })

it('opens the thread of a clicked result', async () => {
  mock.get.mockResolvedValue({
    data: { items: [{ id: 9, title: 'T', threadId: 42 }] },
  })
  await search()
  fireEvent.click(await screen.findByTestId('search-result-9'))
  expect(push).toHaveBeenCalledWith('/site/s/forum/thread/42')
})
it('falls back to the result url and ignores unlinked results', async () => {
  mock.get.mockResolvedValue({
    data: { items: [{ id: 1, url: '/forum/thread/7#p1' }, { id: 2 }] },
  })
  await search()
  fireEvent.click(await screen.findByTestId('search-result-1'))
  expect(push).toHaveBeenCalledWith('/site/s/forum/thread/7')
  fireEvent.click(screen.getByTestId('search-result-2'))
  expect(push).toHaveBeenCalledTimes(1)
})
