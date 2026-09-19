import CommentItem from '@/components/common/comment/CommentItem'
import { makeUser } from './renderWithStore'
import { renderPlain } from './plainStore'
import type { Comment } from '@/components/common/comment/types'
import { m } from './scopeApi'

export { m }
export const refresh = jest.fn()
export const boom = { response: { data: { error: 'boom' } } }
export const resetApi = () => {
  Object.values(m).forEach((f) => f.mockReset().mockResolvedValue({}))
  refresh.mockReset()
}

export const c: Comment = {
  id: 5,
  userId: 1,
  username: 'bob',
  contentType: 'a',
  contentId: 2,
  body: 'hello',
  parentId: null,
  likes: 0,
  dislikes: 0,
  createdAt: 'x',
  updatedAt: 'x',
  children: [],
}
type U = ReturnType<typeof makeUser> | null
export const show = (u: U = makeUser(), depth = 1) =>
  renderPlain(
    <CommentItem
      comment={c}
      contentType="a"
      contentId={2}
      depth={depth}
      onRefresh={refresh}
    />,
    u ?? undefined,
  )
