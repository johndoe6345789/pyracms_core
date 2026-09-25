import { render, screen, fireEvent } from '@testing-library/react'
import GalleryHero from '@/components/gallery/GalleryHero'
import AlbumCoverPicker from '@/components/gallery/AlbumCoverPicker'
import AlbumManageDialogs from '@/components/gallery/AlbumManageDialogs'
import { m } from '../../helpers/scopeApi'

jest.mock(
  '@/lib/api',
  () => jest.requireActual('../../helpers/apiMock').apiMock,
)

const pics = [
  { id: '5', title: 'One', src: '/a.jpg', cols: 1, rows: 1 },
  { id: '6', title: 'Two', src: '/b.jpg', cols: 1, rows: 1 },
]

it('shows the featured photo as a link to its page', () => {
  render(
    <GalleryHero
      slug="s"
      photo={{ id: '9', title: 'Dawn', albumName: 'Trip', src: '/x.jpg' }}
    />,
  )
  const hero = screen.getByTestId('gallery-hero')
  expect(hero).toHaveAttribute('href', '/site/s/gallery/picture/9')
  expect(hero).toHaveTextContent('Dawn')
  expect(hero).toHaveTextContent('From Trip')
})

it('picks and clears a cover, and says when there are no pictures', () => {
  const onChange = jest.fn()
  const { rerender } = render(
    <AlbumCoverPicker pictures={pics} value={5} onChange={onChange} />,
  )
  fireEvent.click(screen.getByTestId('cover-choice-6'))
  expect(onChange).toHaveBeenLastCalledWith(6)
  fireEvent.click(screen.getByTestId('cover-choice-5')) // clicking it again
  expect(onChange).toHaveBeenLastCalledWith(0)
  rerender(<AlbumCoverPicker pictures={[]} value={0} onChange={onChange} />)
  expect(screen.getByText(/Upload pictures/)).toBeInTheDocument()
})

it('saves every album option in one request', () => {
  m.put.mockResolvedValue({ data: {} })
  const onChanged = jest.fn()
  render(
    <AlbumManageDialogs
      id="3"
      name="Trip"
      description="d"
      options={{ isPrivate: false, sortOrder: 'newest', coverPictureId: 0 }}
      pictures={pics}
      open="edit"
      onClose={jest.fn()}
      onChanged={onChanged}
      onDeleted={jest.fn()}
    />,
  )
  fireEvent.click(screen.getByTestId('cover-choice-6'))
  fireEvent.click(screen.getByLabelText('Private album'))
  fireEvent.click(screen.getByTestId('gallery-edit-save'))
  expect(m.put).toHaveBeenCalledWith('/api/gallery/albums/3', {
    displayName: 'Trip',
    description: 'd',
    isPrivate: true,
    sortOrder: 'newest',
    defaultPictureId: 6,
  })
})
