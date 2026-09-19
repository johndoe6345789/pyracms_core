export const MOCK_REVISIONS = [
  {
    number: 3,
    author: 'admin',
    date: '2024-01-03',
    summary: 'Fixed typo',
  },
  {
    number: 2,
    author: 'admin',
    date: '2024-01-02',
    summary: 'Added section',
  },
  {
    number: 1,
    author: 'admin',
    date: '2024-01-01',
    summary: 'Initial draft',
  },
]

export const MOCK_SNIPPET = {
  id: 42,
  title: 'Fibonacci',
  language: 'python',
  code: 'def fib(n): return n if n < 2 else fib(n-1)+fib(n-2)',
  authorUsername: 'admin',
  createdAt: '2024-01-01T00:00:00Z',
  runCount: 7,
}

export const MOCK_USER = {
  id: 1,
  username: 'admin',
  email: 'admin@example.com',
  bio: 'Site administrator',
  location: 'Earth',
  avatarUrl: '',
  reputation: 42,
  createdAt: '2024-01-01T00:00:00Z',
}
