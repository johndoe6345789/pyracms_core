'use client'

export interface Revision {
  number: number
  author: string
  date: string
  summary: string
}

const PLACEHOLDER_REVISIONS: Revision[] = [
  { number: 5, author: 'Jane Smith', date: '2026-03-10 14:30', summary: 'Added conclusion section' },
  { number: 4, author: 'Jane Smith', date: '2026-03-09 10:15', summary: 'Updated data fetching section with new examples' },
  { number: 3, author: 'John Doe', date: '2026-03-07 16:45', summary: 'Fixed typos in App Router section' },
  { number: 2, author: 'Jane Smith', date: '2026-03-05 09:00', summary: 'Added App Router and Data Fetching sections' },
  { number: 1, author: 'Jane Smith', date: '2026-03-03 11:20', summary: 'Initial draft' },
]

export function useRevisions(_name: string) {
  const revisions = PLACEHOLDER_REVISIONS
  const latestRevision = revisions[0]?.number ?? 0
  return { revisions, latestRevision }
}
