export interface CodeAlbum {
  id: string
  name: string
  description: string
  snippetCount: number
}

const PLACEHOLDER_CODE_ALBUMS: CodeAlbum[] = [
  {
    id: 'python-snippets',
    name: 'Python Snippets',
    description: 'Useful Python code snippets for data processing and scripting.',
    snippetCount: 15,
  },
  {
    id: 'cpp-algorithms',
    name: 'C++ Algorithms',
    description:
      'Common algorithm implementations in C++ with performance benchmarks.',
    snippetCount: 22,
  },
  {
    id: 'web-utils',
    name: 'Web Utilities',
    description:
      'JavaScript and TypeScript utilities for frontend and backend development.',
    snippetCount: 18,
  },
  {
    id: 'shell-scripts',
    name: 'Shell Scripts',
    description: 'Bash and shell scripts for automation and system administration.',
    snippetCount: 9,
  },
  {
    id: 'sql-queries',
    name: 'SQL Queries',
    description: 'Common SQL queries and database patterns for reference.',
    snippetCount: 12,
  },
]

export function useCodeAlbums() {
  const albums: CodeAlbum[] = PLACEHOLDER_CODE_ALBUMS
  return { albums }
}
