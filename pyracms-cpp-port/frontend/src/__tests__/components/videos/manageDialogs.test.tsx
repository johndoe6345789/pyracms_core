import { fireEvent, render, screen, within } from '@testing-library/react'
import VideoManageDialogs from '@/components/videos/VideoManageDialogs'
import type { VideoManageState } from '@/hooks/useVideoManage'

const manage = (over: Partial<VideoManageState> = {}): VideoManageState => ({
  dialog: 'edit',
  form: { title: 'Cat', description: 'd', visibility: 'public' },
  set: jest.fn(),
  busy: false,
  error: '',
  open: jest.fn(),
  close: jest.fn(),
  save: jest.fn(),
  confirmDelete: jest.fn(),
  ...over,
})

it('edits title, description and visibility', () => {
  const m = manage({ error: 'Nope' })
  render(<VideoManageDialogs m={m} />)
  fireEvent.change(screen.getByTestId('video-title-input'), {
    target: { value: 'Dog' },
  })
  fireEvent.change(screen.getByTestId('video-desc-input'), {
    target: { value: 'x' },
  })
  fireEvent.change(screen.getByTestId('video-visibility'), {
    target: { value: 'private' },
  })
  expect(m.set).toHaveBeenCalledWith({ title: 'Dog' })
  expect(m.set).toHaveBeenCalledWith({ description: 'x' })
  expect(m.set).toHaveBeenCalledWith({ visibility: 'private' })
  expect(screen.getByTestId('video-manage-error')).toHaveTextContent('Nope')
  fireEvent.click(screen.getByTestId('video-edit-save'))
  expect(m.save).toHaveBeenCalled()
})

it('confirms deletion', () => {
  const m = manage({ dialog: 'delete' })
  render(<VideoManageDialogs m={m} />)
  const dlg = screen.getByTestId('gallery-delete-dialog')
  expect(within(dlg).getByText(/Delete "Cat"\?/)).toBeInTheDocument()
  fireEvent.click(screen.getByTestId('gallery-delete-confirm'))
  expect(m.confirmDelete).toHaveBeenCalled()
})
