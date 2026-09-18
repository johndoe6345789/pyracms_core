import { render, screen, fireEvent } from '@testing-library/react'
import FileGrid from '@/components/admin/FileGrid'
import UploadDropzone from '@/components/admin/UploadDropzone'

const mk = (id: number, type: string) => ({
  id, name: `f${id}`, size: 2048, type, downloads: 3,
  uploadedAt: '2024-01-01', uuid: `u${id}`,
})
const files = [
  mk(1, 'image/png'), mk(2, 'application/pdf'),
  mk(3, 'text/plain'), mk(4, 'application/zip'),
]

it('renders a card per file and deletes', () => {
  const onDelete = jest.fn()
  render(<FileGrid files={files} onDelete={onDelete} />)
  expect(screen.getByTestId('file-grid').children).toHaveLength(4)
  expect(screen.getByTestId('file-card-1')).toHaveTextContent('2.0 KB')
  expect(screen.getByTestId('file-card-1')).toHaveTextContent('3 downloads')
  fireEvent.click(screen.getByTestId('delete-file-3'))
  expect(onDelete).toHaveBeenCalledWith(files[2])
})

function dz(over = {}) {
  const p = {
    dragOver: false, onDragOver: jest.fn(), onDragLeave: jest.fn(),
    onDrop: jest.fn(), ...over,
  }
  render(<UploadDropzone {...p} />)
  return p
}

it('forwards drag events', () => {
  const p = dz({ dragOver: true })
  const zone = screen.getByTestId('upload-dropzone')
  fireEvent.dragOver(zone)
  fireEvent.dragLeave(zone)
  fireEvent.drop(zone)
  expect(p.onDragOver).toHaveBeenCalled()
  expect(p.onDragLeave).toHaveBeenCalled()
  expect(p.onDrop).toHaveBeenCalled()
})

it('reports files chosen through the input', () => {
  const onFilesSelected = jest.fn()
  dz({ onFilesSelected })
  const input = screen.getByTestId('upload-file-input')
  const f = new File(['a'], 'a.txt')
  fireEvent.change(input, { target: { files: [f] } })
  expect(onFilesSelected).toHaveBeenCalledTimes(1)
  fireEvent.change(input, { target: { files: [] } })
  expect(onFilesSelected).toHaveBeenCalledTimes(1)
})

it('tolerates a missing handler', () => {
  dz()
  const f = new File(['a'], 'a.txt')
  fireEvent.change(screen.getByTestId('upload-file-input'),
    { target: { files: [f] } })
  expect(screen.getByTestId('upload-files-btn')).toBeInTheDocument()
})
