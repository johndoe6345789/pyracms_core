import { render, screen } from '@testing-library/react'
import { SearchResultRow } from '@/components/search/SearchResultRow'
import { SearchResultTitle } from '@/components/search/SearchResultTitle'

const result = {
  type: 'article',
  id: 1,
  title: 'Hello',
  snippet: 'a needle here',
  url: '/a/1',
  rank: 1,
  createdAt: '',
}

describe('SearchResultRow', () => {
  it('links and highlights the snippet', () => {
    render(
      <SearchResultRow index={0} last={false} query="needle" result={result} />,
    )
    expect(screen.getByTestId('search-result-0')).toHaveAttribute(
      'href',
      '/a/1',
    )
    expect(document.querySelector('mark')).toHaveTextContent('needle')
  })

  it('falls back for unknown types and empty snippets', () => {
    render(
      <SearchResultRow
        index={1}
        last
        query=""
        result={{ ...result, type: 'other', snippet: '' }}
      />,
    )
    expect(screen.getByText('other')).toBeInTheDocument()
  })
})

describe('SearchResultTitle', () => {
  it('uses a neutral color for unknown types', () => {
    render(<SearchResultTitle result={{ ...result, type: 'x' }} />)
    expect(screen.getByText('Hello')).toBeInTheDocument()
  })
})
