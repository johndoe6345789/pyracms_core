import { render, screen, fireEvent } from '@testing-library/react'
import FileCard from '@/components/admin/FileCard'
import FileGrid from '@/components/admin/FileGrid'
import FileIcon from '@/components/admin/FileIcon'
import UploadDropzone from '@/components/admin/UploadDropzone'

const file = (id: number, type: string) => ({
  id, name: `f${id}`, size: 2048, type, downloads: 3,
  uploadedAt: '2024-01-01', uuid: `u${id}`,
})

it('FileCard shows meta and deletes', () => {
  const onDelete = jest.fn()
  render(<FileCard file={file(1, 'text/plain')} onDelete={onDelete} />)
  expect(screen.getByText('2.0 KB')).toBeInTheDocument()
  expect(screen.getByText('3 downloads')).toBeInTheDocument()
  fireEvent.click(screen.getByTestId('delete-file-1'))
  expect(onDelete).toHaveBeenCalledWith(file(1, 'text/plain'))
})

it('FileGrid renders cards', () => {
  render(<FileGrid files={[file(1, 'a/b'), file(2, 'a/b')]}
    onDelete={jest.fn()} />)
  expect(screen.getByTestId('file-card-2')).toBeInTheDocument()
})

it.each(['image/png', 'application/pdf', 'text/x', 'other'])(
  'FileIcon handles %s', (t) => {
    const { container } = render(<FileIcon type={t} />)
    expect(container.querySelector('svg')).toBeInTheDocument()
  })

it('UploadDropzone handles drag and selection', () => {
  const p = { onDragOver: jest.fn(), onDragLeave: jest.fn(),
    onDrop: jest.fn(), onFilesSelected: jest.fn() }
  const { rerender } = render(<UploadDropzone dragOver={false} {...p} />)
  const zone = screen.getByTestId('upload-dropzone')
  fireEvent.dragOver(zone)
  fireEvent.dragLeave(zone)
  fireEvent.drop(zone)
  expect(p.onDragOver).toHaveBeenCalled()
  expect(p.onDragLeave).toHaveBeenCalled()
  expect(p.onDrop).toHaveBeenCalled()
  const input = screen.getByTestId('upload-file-input')
  const f = new File(['a'], 'a.txt')
  fireEvent.change(input, { target: { files: [f] } })
  expect(p.onFilesSelected).toHaveBeenCalled()
  fireEvent.change(input, { target: { files: [] } })
  expect(p.onFilesSelected).toHaveBeenCalledTimes(1)
  rerender(<UploadDropzone dragOver {...p} onFilesSelected={undefined} />)
  fireEvent.change(screen.getByTestId('upload-file-input'),
    { target: { files: [f] } })
})
