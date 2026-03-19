'use client'

import { useState } from 'react'

export interface ArticleSummary {
  name: string
  title: string
  excerpt: string
  author: string
  date: string
  views: number
  tags: string[]
}

const PLACEHOLDER_ARTICLES: ArticleSummary[] = [
  {
    name: 'getting-started-with-nextjs',
    title: 'Getting Started with Next.js',
    excerpt:
      'Learn how to build modern web applications with Next.js, the React framework for production.',
    author: 'Jane Smith',
    date: '2026-03-10',
    views: 1243,
    tags: ['nextjs', 'react', 'tutorial'],
  },
  {
    name: 'understanding-typescript',
    title: 'Understanding TypeScript',
    excerpt:
      'A comprehensive guide to TypeScript fundamentals and advanced patterns for JavaScript developers.',
    author: 'John Doe',
    date: '2026-03-08',
    views: 892,
    tags: ['typescript', 'javascript'],
  },
  {
    name: 'material-ui-best-practices',
    title: 'Material UI Best Practices',
    excerpt:
      'Explore best practices for building beautiful and accessible UIs with Material UI components.',
    author: 'Alice Johnson',
    date: '2026-03-05',
    views: 567,
    tags: ['mui', 'design', 'react'],
  },
  {
    name: 'rest-api-design',
    title: 'REST API Design Principles',
    excerpt:
      'Design robust and scalable REST APIs following industry-standard principles and conventions.',
    author: 'Bob Williams',
    date: '2026-02-28',
    views: 2105,
    tags: ['api', 'backend', 'architecture'],
  },
  {
    name: 'css-grid-layout',
    title: 'Mastering CSS Grid Layout',
    excerpt:
      'Unlock the full power of CSS Grid to create complex responsive layouts with ease.',
    author: 'Jane Smith',
    date: '2026-02-20',
    views: 734,
    tags: ['css', 'layout', 'frontend'],
  },
  {
    name: 'docker-for-developers',
    title: 'Docker for Developers',
    excerpt:
      'Get up and running with Docker containers for local development and deployment workflows.',
    author: 'John Doe',
    date: '2026-02-15',
    views: 1589,
    tags: ['docker', 'devops'],
  },
]

export function useArticles() {
  const [searchQuery, setSearchQuery] = useState('')
  const articles = PLACEHOLDER_ARTICLES

  const filtered = articles.filter(
    (a) =>
      a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  return { articles: filtered, searchQuery, setSearchQuery }
}
