'use client'

export interface Forum {
  id: string
  name: string
  description: string
  threads: number
  posts: number
}

export interface ForumCategory {
  id: string
  name: string
  forums: Forum[]
}

const PLACEHOLDER_CATEGORIES: ForumCategory[] = [
  {
    id: 'general',
    name: 'General Discussion',
    forums: [
      { id: 'introductions', name: 'Introductions', description: 'Introduce yourself to the community.', threads: 45, posts: 312 },
      { id: 'off-topic', name: 'Off-Topic', description: 'Chat about anything not covered by other forums.', threads: 128, posts: 1547 },
    ],
  },
  {
    id: 'development',
    name: 'Development',
    forums: [
      { id: 'frontend', name: 'Frontend Development', description: 'Discuss HTML, CSS, JavaScript, React, and other frontend topics.', threads: 234, posts: 2891 },
      { id: 'backend', name: 'Backend Development', description: 'Topics related to server-side development, APIs, and databases.', threads: 189, posts: 2105 },
      { id: 'devops', name: 'DevOps & Infrastructure', description: 'CI/CD, cloud platforms, containers, and infrastructure automation.', threads: 76, posts: 834 },
    ],
  },
  {
    id: 'support',
    name: 'Support',
    forums: [
      { id: 'help', name: 'Help & Questions', description: 'Ask for help with issues or general questions.', threads: 567, posts: 4231 },
      { id: 'bug-reports', name: 'Bug Reports', description: 'Report bugs and issues you have encountered.', threads: 89, posts: 456 },
    ],
  },
]

export function useForumCategories() {
  const categories = PLACEHOLDER_CATEGORIES
  return { categories }
}
