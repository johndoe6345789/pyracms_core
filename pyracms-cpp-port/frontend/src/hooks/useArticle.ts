'use client'

export interface Article {
  title: string
  content: string
  author: string
  createdDate: string
  renderer: string
  views: number
  likes: number
  dislikes: number
  tags: string[]
  revisionNumber: number
}

const PLACEHOLDER_ARTICLE: Article = {
  title: 'Getting Started with Next.js',
  content: `
    <h2>Introduction</h2>
    <p>Next.js is a powerful React framework that enables server-side rendering, static site generation, and more. In this article, we will explore the fundamentals of building modern web applications with Next.js.</p>
    <h2>Setting Up Your Project</h2>
    <p>To get started, you can create a new Next.js project using the create-next-app CLI tool. This sets up everything you need, including TypeScript support, ESLint configuration, and a development server.</p>
    <h2>App Router</h2>
    <p>Next.js 14 introduced the App Router, a new paradigm for building applications using React Server Components. The App Router uses a file-system based routing approach where folders define routes.</p>
    <h2>Data Fetching</h2>
    <p>With the App Router, you can fetch data directly in your components using async/await. Server Components make it easy to fetch data on the server without additional client-side libraries.</p>
    <h2>Conclusion</h2>
    <p>Next.js provides a robust foundation for building modern web applications. Whether you are building a simple blog or a complex enterprise application, Next.js has the tools and patterns to support your needs.</p>
  `,
  author: 'Jane Smith',
  createdDate: '2026-03-10',
  renderer: 'HTML',
  views: 1243,
  likes: 42,
  dislikes: 3,
  tags: ['nextjs', 'react', 'tutorial', 'webdev'],
  revisionNumber: 5,
}

export function useArticle(_name: string) {
  const article = PLACEHOLDER_ARTICLE
  return { article }
}
