export interface SearchHit {
  type: string
  id: number
  title: string
  /** the title with matches marked (see marks.ts), '' when none */
  titleMarked: string
  /** a short excerpt with matches marked */
  snippet: string
  /** where the hit lives, already under /site/<slug> */
  url: string
  createdAt: string
  author: string
  tags: string[]
}

export interface SearchPage {
  items: SearchHit[]
  totalCount: number
  /** hits per kind, over the whole site (not just the chosen kind) */
  facets: Record<string, number>
}

/** A quick suggestion while typing. */
export interface Suggestion {
  type: string
  title: string
  snippet: string
  url: string
}

export const PAGE_SIZE = 10
