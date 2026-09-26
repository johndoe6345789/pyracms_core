import { render, screen, fireEvent } from '@testing-library/react'
import Marked from '@/components/search/Marked'
import SearchBox from '@/components/search/SearchBox'
import KindTabs from '@/components/search/KindTabs'
import { MARK_CLOSE, MARK_OPEN } from '@/lib/search/marks'

it('shows matches as <mark> and never as HTML', () => {
  const { container } = render(
    <Marked text={`a ${MARK_OPEN}<b>golf</b>${MARK_CLOSE} c`} />,
  )
  expect(container.querySelector('mark')?.textContent).toBe('<b>golf</b>')
  expect(container.querySelector('b')).toBeNull()
})

it('search box submits, ignores blanks, clears and follows the URL', () => {
  const onSubmit = jest.fn()
  const { rerender } = render(<SearchBox value="golf" onSubmit={onSubmit} />)
  const input = screen.getByTestId('search-input') as HTMLInputElement
  fireEvent.submit(screen.getByTestId('search-box'))
  expect(onSubmit).toHaveBeenCalledWith('golf')
  fireEvent.click(screen.getByLabelText('Clear search'))
  expect(input.value).toBe('')
  fireEvent.submit(screen.getByTestId('search-box'))
  expect(onSubmit).toHaveBeenCalledTimes(1)
  rerender(<SearchBox value="trains" onSubmit={onSubmit} autoFocus />)
  expect(input.value).toBe('trains')
})

it('kind tabs count each kind and pick one', () => {
  const onChange = jest.fn()
  render(
    <KindTabs
      facets={{ snippet: 2, article: 3, podcast: 1, album: 0 }}
      active="article"
      total={6}
      onChange={onChange}
    />,
  )
  expect(screen.getByTestId('kind-all')).toHaveTextContent('All 6')
  expect(screen.getByTestId('kind-article')).toHaveTextContent('Articles 3')
  expect(screen.getByTestId('kind-article')).toHaveAttribute(
    'aria-selected',
    'true',
  )
  expect(screen.queryByTestId('kind-album')).toBeNull() // nothing of that kind
  fireEvent.click(screen.getByTestId('kind-podcast'))
  expect(onChange).toHaveBeenCalledWith('podcast')
  fireEvent.click(screen.getByTestId('kind-all'))
  expect(onChange).toHaveBeenCalledWith('all')
})
