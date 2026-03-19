'use client'

import { useState } from 'react'

export interface Post {
  id: string
  author: string
  date: string
  content: string
  likes: number
  dislikes: number
  isOwner: boolean
}

export interface ThreadInfo {
  title: string
  description: string
}

const PLACEHOLDER_THREAD: ThreadInfo = {
  title: 'Next.js vs Remix: Which should I choose?',
  description:
    'I am starting a new project and trying to decide between Next.js and Remix. Looking for advice from people who have used both.',
}

const PLACEHOLDER_POSTS: Post[] = [
  { id: '1', author: 'Alice Johnson', date: '2026-03-15 14:30', content: 'I have been using Next.js for about two years now, and I recently tried Remix for a side project. Both are great frameworks, but they have different philosophies. Next.js leans heavily into React Server Components and has excellent static generation support. Remix focuses more on web standards and progressive enhancement. For most projects, I would recommend Next.js because of its larger ecosystem and community.', likes: 12, dislikes: 1, isOwner: false },
  { id: '2', author: 'Bob Williams', date: '2026-03-15 15:45', content: 'I would actually argue in favor of Remix for form-heavy applications. Its approach to mutations and error handling using web standards is really elegant. That said, if you need SSG or ISR, Next.js is the way to go.', likes: 8, dislikes: 0, isOwner: false },
  { id: '3', author: 'Jane Smith', date: '2026-03-16 09:00', content: 'It depends on your use case. I have used both in production:\n\n- Next.js: Better for content-heavy sites, blogs, e-commerce\n- Remix: Better for complex forms, dashboards, internal tools\n\nBoth have excellent TypeScript support and great developer experience.', likes: 15, dislikes: 2, isOwner: true },
  { id: '4', author: 'Charlie Brown', date: '2026-03-16 11:30', content: 'One thing to consider is deployment. Next.js has Vercel which makes deployment trivial. Remix can be deployed anywhere but you need to set up your own server adapter. For a team that values simplicity in deployment, Next.js + Vercel is hard to beat.', likes: 6, dislikes: 0, isOwner: false },
  { id: '5', author: 'Alice Johnson', date: '2026-03-18 09:15', content: 'Great points from everyone. I should also mention that Next.js 15 has some really impressive improvements to the App Router. The caching story is much simpler now. I would say go with Next.js unless you have a specific reason to choose Remix.', likes: 4, dislikes: 0, isOwner: false },
]

export function useThread(_threadId: string) {
  const thread = PLACEHOLDER_THREAD
  const posts = PLACEHOLDER_POSTS
  const [replyContent, setReplyContent] = useState('')

  return { thread, posts, replyContent, setReplyContent }
}
