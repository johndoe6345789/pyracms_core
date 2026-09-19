import { render, screen, fireEvent } from '@testing-library/react'
import api from '@/lib/api'
import ArticleOwnerActions from '@/components/articles/ArticleOwnerActions'
import type { Article } from '@/hooks/useArticle'
import { asMockApi } from './mockApi'

export const m = asMockApi<'post' | 'put' | 'delete'>(api)
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
export const changed = jest.fn()
export const deleted = jest.fn()
export const mount = (a: Partial<Article> = {}, tenantId: number | null = 3) =>
  render(
    <ArticleOwnerActions
      article={{ ...base, ...a }}
      name="n"
      tenantId={tenantId}
      onChanged={changed}
      onDeleted={deleted}
    />,
  )
export const click = (id: string) => fireEvent.click(screen.getByTestId(id))

export const resetAll = () => {
  Object.values(m).forEach((f) => f.mockReset().mockResolvedValue({}))
  changed.mockReset()
  deleted.mockReset()
}
