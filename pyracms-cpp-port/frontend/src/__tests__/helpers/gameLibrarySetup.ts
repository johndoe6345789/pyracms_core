import { within, screen } from '@testing-library/react'

export const rows = [
  { name: 'a', displayName: 'Alpha', tags: ['x'] },
  { name: 'b', displayName: 'Beta', tags: [] },
]
export const grid = () => within(screen.getByTestId('browse-grid'))
export const okGet = (url: string) => Promise.resolve(
  url.includes('limit') ? { data: rows }
    : { data: { name: 'a', displayName: 'Alpha', revisions: [] } })
