// Constants

export const SLUG = 'demo'

export const BASE = `/site/${SLUG}`

// Shared mock data

export const MOCK_TENANT = [{ id: 1, slug: SLUG, name: 'Demo' }]

export const MOCK_ARTICLE = {
  id: 1,
  name: 'hello-world',
  displayName: 'Hello World',
  title: 'Hello World',
  content: '<p>Hello from the test.</p>',
  renderer: 'html',
  rendererName: 'html',
  author: 'admin',
  createdDate: '2024-01-01',
  tags: ['test', 'demo'],
  views: 42,
  likes: 5,
  dislikes: 1,
  revisionNumber: 3,
}

export const MOCK_ARTICLES_LIST = {
  items: [
    {
      id: 1,
      name: 'hello-world',
      title: 'Hello World',
      excerpt: 'A sample article.',
      author: 'admin',
      date: '2024-01-01',
      tags: ['test'],
      views: 42,
    },
    {
      id: 2,
      name: 'second-post',
      title: 'Second Post',
      excerpt: 'Another article.',
      author: 'admin',
      date: '2024-01-02',
      tags: [],
      views: 10,
    },
  ],
  total: 2,
}

// Shapes mirror the C++ API: forum/thread rows use name, authorUsername,
// viewCount, totalThreads and totalPosts; posts use username, likes.
export const MOCK_CATEGORY = {
  id: 1,
  name: 'General',
  forums: [
    {
      id: 1,
      name: 'General Discussion',
      description: 'Talk about anything.',
      categoryId: 1,
      totalThreads: 5,
      totalPosts: 20,
    },
  ],
}
