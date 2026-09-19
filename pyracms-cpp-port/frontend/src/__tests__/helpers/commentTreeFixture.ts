import type { Comment } from '@/components/common/comment/types'

export const mk = (id: number, kids: Comment[] = []): Comment => ({
  id,
  userId: 1,
  username: 'bob',
  contentType: 'a',
  contentId: 1,
  body: `c${id}`,
  parentId: null,
  likes: 0,
  dislikes: 0,
  createdAt: 'x',
  updatedAt: 'x',
  children: kids,
})
export const flat = (id: number, parentId: number | null = null) => {
  const { children, ...rest } = mk(id)
  void children
  return { ...rest, parentId }
}
