'use client'

export interface ThreadSummary {
  id: string
  title: string
  author: string
  replies: number
  views: number
  lastPostDate: string
  pinned: boolean
}

export interface ForumInfo {
  name: string
  description: string
}

const PLACEHOLDER_FORUM: ForumInfo = {
  name: 'Frontend Development',
  description: 'Discuss HTML, CSS, JavaScript, React, and other frontend topics.',
}

const PLACEHOLDER_THREADS: ThreadSummary[] = [
  { id: 'nextjs-vs-remix', title: 'Next.js vs Remix: Which should I choose?', author: 'Alice Johnson', replies: 24, views: 1892, lastPostDate: '2026-03-18 09:15', pinned: true },
  { id: 'react-19-features', title: 'What are the most exciting React 19 features?', author: 'Bob Williams', replies: 18, views: 1456, lastPostDate: '2026-03-17 21:30', pinned: true },
  { id: 'css-has-selector', title: 'The :has() CSS selector is a game-changer', author: 'Jane Smith', replies: 12, views: 934, lastPostDate: '2026-03-17 16:45', pinned: false },
  { id: 'tailwind-vs-mui', title: 'Tailwind CSS vs Material UI - pros and cons', author: 'John Doe', replies: 31, views: 2341, lastPostDate: '2026-03-16 14:20', pinned: false },
  { id: 'typescript-generics', title: 'Help understanding TypeScript generics', author: 'Charlie Brown', replies: 8, views: 567, lastPostDate: '2026-03-16 10:00', pinned: false },
  { id: 'web-components', title: 'Are Web Components finally ready for production?', author: 'Diana Prince', replies: 15, views: 1123, lastPostDate: '2026-03-15 18:30', pinned: false },
  { id: 'state-management', title: 'Best state management solution in 2026?', author: 'Eve Davis', replies: 27, views: 1834, lastPostDate: '2026-03-14 12:15', pinned: false },
]

export function useThreadList(_forumId: string) {
  const forum = PLACEHOLDER_FORUM
  const threads = PLACEHOLDER_THREADS
  return { forum, threads }
}
