export const MOCK_THREAD_ROW = {
  id: 1,
  name: 'Welcome Thread',
  description: 'First thread here.',
  forumId: 1,
  userId: 1,
  authorUsername: 'admin',
  pinned: false,
  locked: false,
  totalPosts: 3,
  viewCount: 15,
  createdAt: '2024-01-01T00:00:00Z',
  lastPostAt: '2024-01-01T10:00:00Z',
}

export const MOCK_FORUM = {
  id: 1,
  name: 'General Discussion',
  description: 'Talk about anything.',
  categoryId: 1,
  totalThreads: 1,
  totalPosts: 3,
  threads: [MOCK_THREAD_ROW],
}

export const MOCK_POSTS = [
  {
    id: 1,
    title: '',
    threadId: 1,
    userId: 1,
    username: 'admin',
    content: 'First post content.',
    createdAt: '2024-01-01T10:00:00Z',
    likes: 2,
    dislikes: 0,
  },
]

export const MOCK_THREAD = {
  ...MOCK_THREAD_ROW,
  forumName: 'General Discussion',
  posts: MOCK_POSTS,
}

export const MOCK_THREADS = [MOCK_THREAD_ROW]

export const MOCK_ALBUMS = [
  {
    id: 1,
    name: 'Vacation 2024',
    coverUrl: '',
    pictureCount: 5,
  },
]
