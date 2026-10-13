import { fireEvent, render, screen } from '@testing-library/react'
import VideosHeader from '@/components/videos/VideosHeader'

const setup = (canUpload: boolean) => {
  const onSort = jest.fn()
  const onSearch = jest.fn()
  render(
    <VideosHeader
      slug="s"
      canUpload={canUpload}
      sort="newest"
      onSort={onSort}
      onSearch={onSearch}
    />,
  )
  return { onSort, onSearch }
}

it('offers Upload to signed-in people only', () => {
  setup(true)
  expect(screen.getByTestId('video-upload-link')).toHaveAttribute(
    'href',
    '/site/s/videos/upload',
  )
})

it('hides Upload from guests and switches the sort', () => {
  const { onSort } = setup(false)
  expect(screen.queryByTestId('video-upload-link')).toBeNull()
  fireEvent.click(screen.getByRole('button', { name: 'Popular' }))
  expect(onSort).toHaveBeenCalledWith('popular')
  fireEvent.click(screen.getByRole('button', { name: 'Latest' }))
  expect(onSort).toHaveBeenCalledTimes(1)
})

it('searches with the trimmed words', () => {
  const { onSearch } = setup(false)
  fireEvent.change(screen.getByLabelText('Search videos'), {
    target: { value: ' cats ' },
  })
  fireEvent.click(screen.getByRole('button', { name: 'Search' }))
  expect(onSearch).toHaveBeenCalledWith('cats')
})
