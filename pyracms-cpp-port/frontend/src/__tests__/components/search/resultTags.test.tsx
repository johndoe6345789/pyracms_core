import { render, screen } from '@testing-library/react'
import ResultCard from '@/components/search/ResultCard'
import type { SearchHit } from '@/lib/search/types'

const hit: SearchHit = {
  type: 'article',
  id: 1,
  title: 'Videos',
  titleMarked: '',
  snippet: '',
  url: '/site/rog/articles/videos',
  createdAt: '',
  author: '',
  tags: ['golf', 'sport'],
}

it('tags that match the search stand out', () => {
  render(<ResultCard hit={hit} index={0} slug="rog" query="Golf swing" />)
  expect(screen.getByRole('link', { name: 'golf' })).toHaveClass(
    'MuiChip-colorPrimary',
  )
  expect(screen.getByRole('link', { name: 'sport' })).not.toHaveClass(
    'MuiChip-colorPrimary',
  )
})
