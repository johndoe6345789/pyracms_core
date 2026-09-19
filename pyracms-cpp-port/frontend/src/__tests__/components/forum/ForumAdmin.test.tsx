import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import api from '@/lib/api'
import { CategoryAccordion } from '@/components/forum/CategoryAccordion'
import { ForumAdminDialog } from '@/components/forum/ForumAdminDialog'
import { useForumAdmin } from '@/hooks/useForumAdmin'
import { asMockApi } from '../../helpers/mockApi'

jest.mock('@/lib/api', () => ({
  __esModule: true,
  default: { post: jest.fn(), put: jest.fn(), delete: jest.fn() },
}))
const m = asMockApi<'post' | 'put' | 'delete'>(api)
const refresh = jest.fn()
beforeEach(() => {
  Object.values(m).forEach((f) => f.mockReset().mockResolvedValue({}))
  refresh.mockReset()
})

const cat = {
  id: '1', name: 'Gen',
  forums: [{
    id: '2', name: 'Chat', description: 'talk', threads: 0, posts: 0,
  }],
}
function Harness() {
  const admin = useForumAdmin(7, refresh)
  return (
    <>
      <CategoryAccordion category={cat} slug="s" admin={admin} />
      <ForumAdminDialog s={admin} />
    </>
  )
}
const click = (id: string) => fireEvent.click(screen.getByTestId(id))
const type = (id: string, v: string) => fireEvent.change(
  screen.getByTestId(id), { target: { value: v } })

describe('forum admin UI', () => {
  it('adds a forum to a category', async () => {
    render(<Harness />)
    click('add-forum-1')
    expect(screen.getByTestId('forum-admin-submit')).toBeDisabled()
    type('forum-admin-name', 'News')
    type('forum-admin-desc', 'stuff')
    click('forum-admin-submit')
    await waitFor(() => expect(refresh).toHaveBeenCalled())
    expect(m.post).toHaveBeenCalledWith('/api/forum/forums',
      { name: 'News', description: 'stuff', categoryId: 1 })
  })
  it('renames a category, prefilled', async () => {
    render(<Harness />)
    click('rename-category-1')
    expect(screen.getByTestId('forum-admin-name')).toHaveValue('Gen')
    type('forum-admin-name', 'General')
    click('forum-admin-submit')
    await waitFor(() => expect(m.put).toHaveBeenCalledWith(
      '/api/forum/categories/1', { name: 'General' }))
  })
  it('edits a forum', async () => {
    render(<Harness />)
    click('edit-forum-2')
    expect(screen.getByTestId('forum-admin-desc')).toHaveValue('talk')
    click('forum-admin-submit')
    await waitFor(() => expect(m.put).toHaveBeenCalledWith(
      '/api/forum/forums/2', { name: 'Chat', description: 'talk' }))
  })
  it('confirms then deletes, and can cancel', async () => {
    render(<Harness />)
    click('delete-forum-2')
    expect(screen.getByTestId('forum-admin-confirm')).toHaveTextContent('Chat')
    click('forum-admin-cancel')
    expect(m.delete).not.toHaveBeenCalled()
    click('delete-category-1')
    click('forum-admin-submit')
    await waitFor(() => expect(m.delete).toHaveBeenCalledWith(
      '/api/forum/categories/1'))
  })
  it('shows API errors', async () => {
    m.delete.mockRejectedValue({ response: { data: { error: 'Not empty' } } })
    render(<Harness />)
    click('delete-category-1')
    click('forum-admin-submit')
    expect(await screen.findByTestId('forum-admin-error'))
      .toHaveTextContent('Not empty')
  })
})
