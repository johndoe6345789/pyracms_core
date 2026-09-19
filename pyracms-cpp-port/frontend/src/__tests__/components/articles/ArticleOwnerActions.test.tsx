import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import api from '@/lib/api'
import ArticleOwnerActions from '@/components/articles/ArticleOwnerActions'
import type { Article } from '@/hooks/useArticle'
import { asMockApi } from '../../helpers/mockApi'

jest.mock('@/lib/api', () => ({
  __esModule: true,
  default: { post: jest.fn(), put: jest.fn(), delete: jest.fn() },
}))
const m = asMockApi<'post' | 'put' | 'delete'>(api)
beforeEach(() =>
  Object.values(m).forEach((f) => f.mockReset().mockResolvedValue({})),
)

const base: Article = {
  title: 'T',
  content: '',
  author: 'a',
  createdDate: '',
  renderer: 'html',
  views: 0,
  likes: 0,
  dislikes: 0,
  tags: [],
  revisionCount: 1,
  status: 'draft',
  isPrivate: false,
}
const changed = jest.fn()
const deleted = jest.fn()
const mount = (a: Partial<Article> = {}, tenantId: number | null = 3) =>
  render(
    <ArticleOwnerActions
      article={{ ...base, ...a }}
      name="n"
      tenantId={tenantId}
      onChanged={changed}
      onDeleted={deleted}
    />,
  )
const click = (id: string) => fireEvent.click(screen.getByTestId(id))

describe('ArticleOwnerActions', () => {
  beforeEach(() => {
    changed.mockReset()
    deleted.mockReset()
  })

  it('publishes a draft', async () => {
    mount()
    expect(screen.getByTestId('article-status')).toHaveTextContent('draft')
    click('article-publish-btn')
    await waitFor(() => expect(changed).toHaveBeenCalled())
    expect(m.post).toHaveBeenCalledWith('/api/articles/n/publish', {
      tenant_id: 3,
    })
  })
  it('unpublishes a published article and toggles privacy', async () => {
    mount({ status: 'published', isPrivate: true })
    expect(screen.getByTestId('article-private')).toBeInTheDocument()
    click('article-publish-btn')
    await waitFor(() =>
      expect(m.post).toHaveBeenCalledWith('/api/articles/n/unpublish', {
        tenant_id: 3,
      }),
    )
    click('article-private-btn')
    await waitFor(() =>
      expect(m.put).toHaveBeenCalledWith('/api/articles/n/private', {
        tenant_id: 3,
      }),
    )
  })
  it('schedules a publish time', async () => {
    mount()
    fireEvent.change(
      screen.getByTestId('article-schedule-input').querySelector('input')!,
      { target: { value: '2030-01-02T03:04' } },
    )
    click('article-schedule-btn')
    await waitFor(() => expect(changed).toHaveBeenCalled())
    expect(m.post).toHaveBeenCalledWith('/api/articles/n/schedule', {
      tenant_id: 3,
      scheduled_at: new Date('2030-01-02T03:04').toISOString(),
    })
  })
  it('confirms before deleting', async () => {
    mount()
    click('article-delete-btn')
    click('article-delete-confirm')
    await waitFor(() => expect(deleted).toHaveBeenCalled())
    expect(m.delete).toHaveBeenCalledWith('/api/articles/n?tenant_id=3')
  })
  it('shows API errors and skips work without a tenant', async () => {
    m.post.mockRejectedValue({ response: { data: { error: 'Forbidden' } } })
    const { unmount } = mount()
    click('article-publish-btn')
    expect(await screen.findByTestId('article-admin-error')).toHaveTextContent(
      'Forbidden',
    )
    unmount()
    m.post.mockClear()
    mount({}, null)
    click('article-publish-btn')
    expect(m.post).not.toHaveBeenCalled()
  })
})
