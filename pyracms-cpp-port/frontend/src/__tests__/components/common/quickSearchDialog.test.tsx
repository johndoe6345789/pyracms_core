import { render, screen, fireEvent } from '@testing-library/react'
import SearchDialog from '@/components/common/search/SearchDialog'
import { MARK_CLOSE, MARK_OPEN } from '@/lib/search/marks'

const sug = (i: number) => ({
  type: 'article',
  title: `T${i}`,
  snippet: `see ${MARK_OPEN}golf${MARK_CLOSE}`,
  url: `/site/rog/articles/${i}`,
})

it('short input shows no list; clicking a row opens it', () => {
  const onSelect = jest.fn()
  const p = {
    open: true,
    query: 'g',
    results: [sug(3)],
    onClose: jest.fn(),
    onQueryChange: jest.fn(),
    onSelect,
    onSearchPage: jest.fn(),
  }
  const { rerender } = render(<SearchDialog {...p} />)
  expect(screen.queryByTestId('search-all')).toBeNull()
  rerender(<SearchDialog {...p} query="golf" />)
  fireEvent.click(screen.getByTestId('search-result-0'))
  expect(onSelect).toHaveBeenCalledWith(sug(3))
})
