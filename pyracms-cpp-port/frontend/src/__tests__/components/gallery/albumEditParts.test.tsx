import { render, screen, fireEvent } from '@testing-library/react'
import AlbumCoverMode from '@/components/gallery/AlbumCoverMode'
import AlbumDetailsForm from '@/components/gallery/AlbumDetailsForm'
import AlbumPhotoList from '@/components/gallery/AlbumPhotoList'

const pics = [
  { id: '5', title: 'One', description: 'first', src: '/a', cols: 1, rows: 1 },
  { id: '6', title: 'Two', description: '', src: '/b', cols: 1, rows: 1 },
]
const editHook = () =>
  ({
    busy: false,
    setCover: jest.fn(),
    editPicture: jest.fn(),
    removePicture: jest.fn(),
  }) as never

it('picks random or chosen cover', () => {
  const onChange = jest.fn()
  render(
    <AlbumCoverMode
      mode="chosen"
      hasChosen={false}
      disabled={false}
      onChange={onChange}
    />,
  )
  expect(screen.getByText(/use "Set as cover"/)).toBeInTheDocument()
  fireEvent.click(screen.getByLabelText('Random photo'))
  expect(onChange).toHaveBeenCalledWith('random')
})

it('edits and saves the album details', () => {
  const onChange = jest.fn()
  const onSave = jest.fn()
  const value = {
    name: 'T',
    description: 'd',
    isPrivate: false,
    sortOrder: 'newest',
  }
  render(
    <AlbumDetailsForm
      value={value}
      busy={false}
      onChange={onChange}
      onSave={onSave}
    />,
  )
  fireEvent.change(screen.getByTestId('album-title-input'), {
    target: { value: 'New' },
  })
  expect(onChange).toHaveBeenLastCalledWith({ ...value, name: 'New' })
  fireEvent.click(screen.getByLabelText('Private album'))
  expect(onChange).toHaveBeenLastCalledWith({ ...value, isPrivate: true })
  fireEvent.click(screen.getByTestId('album-save-btn'))
  expect(onSave).toHaveBeenCalled()
})

it('lists every photo with cover badge, set-as-cover, edit and delete', () => {
  const edit = editHook() as unknown as Record<string, jest.Mock>
  render(<AlbumPhotoList pictures={pics} coverId={5} edit={edit as never} />)
  expect(screen.getByTestId('cover-badge-5')).toBeInTheDocument()
  expect(screen.getByTestId('set-cover-5')).toBeDisabled()
  fireEvent.click(screen.getByTestId('set-cover-6'))
  expect(edit.setCover).toHaveBeenCalledWith('6')

  fireEvent.click(screen.getByTestId('edit-photo-5'))
  fireEvent.change(screen.getByTestId('gallery-edit-name'), {
    target: { value: 'Renamed' },
  })
  fireEvent.click(screen.getByTestId('gallery-edit-save'))
  expect(edit.editPicture).toHaveBeenCalledWith('5', 'Renamed', 'first')

  fireEvent.click(screen.getByTestId('delete-photo-6'))
  fireEvent.click(screen.getByRole('button', { name: /^delete$/i }))
  expect(edit.removePicture).toHaveBeenCalledWith('6')
})
