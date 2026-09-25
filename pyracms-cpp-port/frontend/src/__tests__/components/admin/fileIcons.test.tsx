import { render, screen } from '@testing-library/react'
import FileCard from '@/components/admin/FileCard'
import FileIcon from '@/components/admin/FileIcon'

const file = (id: number, type: string) => ({
  id,
  name: `f${id}`,
  size: 2048,
  type,
  downloads: 3,
  uploadedAt: '2024-01-01',
  uuid: `u${id}`,
})

it('shows View only for files that open in the browser', () => {
  const { rerender } = render(
    <FileCard
      file={{ ...file(5, 'image/png'), name: 'a.png' }}
      onDelete={jest.fn()}
    />,
  )
  const view = screen.getByTestId('view-file-5')
  expect(view.getAttribute('href')).toMatch(/\/api\/files\/u5\/view$/)
  expect(view).toHaveAttribute('target', '_blank')
  rerender(
    <FileCard
      file={{ ...file(5, 'application/zip'), name: 'a.zip' }}
      onDelete={jest.fn()}
    />,
  )
  expect(screen.queryByTestId('view-file-5')).toBeNull()
})

it('picks an icon and extension label by kind', () => {
  const { rerender } = render(<FileIcon type="" name="route.cdp" />)
  expect(screen.getByTestId('file-icon-other')).toHaveTextContent('.cdp')
  rerender(<FileIcon type="" name="tool.zip" />)
  expect(screen.getByTestId('file-icon-archive')).toBeInTheDocument()
  rerender(<FileIcon type="application/pdf" />)
  expect(screen.getByTestId('file-icon-pdf')).toBeInTheDocument()
})
