import { render, screen, fireEvent } from '@testing-library/react'
import FolderBar from '@/components/admin/FolderBar'
import FolderTiles from '@/components/admin/FolderTiles'
import FolderNameDialog from '@/components/admin/FolderNameDialog'
import MoveFileDialog from '@/components/admin/MoveFileDialog'
import FileThumb from '@/components/admin/FileThumb'

const file = {
  id: 1,
  name: 'f.png',
  size: 1,
  type: 'image/png',
  downloads: 0,
  uploadedAt: '',
  uuid: 'u1',
}

it('shows the trail and goes back up or makes a folder', () => {
  const onOpen = jest.fn()
  const onNew = jest.fn()
  render(<FolderBar folder="a/b" onOpen={onOpen} onNew={onNew} />)
  fireEvent.click(screen.getByText('a'))
  expect(onOpen).toHaveBeenCalledWith('a')
  fireEvent.click(screen.getByTestId('folder-root'))
  expect(onOpen).toHaveBeenCalledWith('')
  fireEvent.click(screen.getByTestId('new-folder-btn'))
  expect(onNew).toHaveBeenCalled()
})

it('lists sub-folders to open or remove; none means nothing', () => {
  const onOpen = jest.fn()
  const onRemove = jest.fn()
  const { container, rerender } = render(
    <FolderTiles folders={['a/b']} onOpen={onOpen} onRemove={onRemove} />,
  )
  fireEvent.click(screen.getByTestId('folder-a/b'))
  expect(onOpen).toHaveBeenCalledWith('a/b')
  fireEvent.click(screen.getByTestId('remove-folder-a/b'))
  expect(onRemove).toHaveBeenCalledWith('a/b')
  rerender(<FolderTiles folders={[]} onOpen={onOpen} onRemove={onRemove} />)
  expect(container).toBeEmptyDOMElement()
})

it('validates a new folder name', () => {
  const onCreate = jest.fn()
  render(<FolderNameDialog open onClose={jest.fn()} onCreate={onCreate} />)
  const input = screen.getByTestId('folder-name-input')
  const create = screen.getByTestId('folder-create-btn')
  expect(create).toBeDisabled()
  fireEvent.change(input, { target: { value: 'a/b' } })
  expect(create).toBeDisabled()
  fireEvent.change(input, { target: { value: 'Photos' } })
  fireEvent.click(create)
  expect(onCreate).toHaveBeenCalledWith('Photos')
})

it('moves a file to the chosen folder', () => {
  const onMove = jest.fn()
  render(
    <MoveFileDialog
      file={file}
      folders={['a']}
      onClose={jest.fn()}
      onMove={onMove}
    />,
  )
  fireEvent.mouseDown(screen.getByRole('combobox'))
  fireEvent.click(screen.getByRole('option', { name: 'a' }))
  fireEvent.click(screen.getByTestId('move-confirm-btn'))
  expect(onMove).toHaveBeenCalledWith(file, 'a')
})

it('previews images and falls back to an icon for other files', () => {
  const { rerender } = render(<FileThumb file={file} />)
  expect(screen.getByTestId('file-thumb-u1').getAttribute('src')).toMatch(
    /\/api\/files\/u1\/thumbnail$/,
  )
  rerender(<FileThumb file={{ ...file, type: 'text/plain' }} />)
  expect(screen.queryByTestId('file-thumb-u1')).toBeNull()
})
