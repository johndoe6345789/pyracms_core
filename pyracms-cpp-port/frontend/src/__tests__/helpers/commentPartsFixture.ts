import type { Comment } from '@/components/common/comment/types'

export const c: Comment = {
  id: 1,
  userId: 1,
  username: 'bob',
  contentType: 'a',
  contentId: 1,
  body: 'hi',
  parentId: null,
  likes: 3,
  dislikes: 1,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
  children: [],
}
