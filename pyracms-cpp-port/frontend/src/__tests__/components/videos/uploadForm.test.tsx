import { fireEvent, render, screen } from '@testing-library/react'
import VideoUploadForm from '@/components/videos/VideoUploadForm'
import type { VideoUploadState } from '@/hooks/useVideoUpload'

const upload = (over: Partial<VideoUploadState> = {}): VideoUploadState => ({
  file: null,
  title: '',
  setTitle: jest.fn(),
  description: '',
  setDescription: jest.fn(),
  visibility: 'public',
  setVisibility: jest.fn(),
  progress: null,
  busy: false,
  error: '',
  pick: jest.fn(),
  submit: jest.fn(),
  ...over,
})

it('picks an MP4 or WebM file', () => {
  const u = upload()
  render(<VideoUploadForm u={u} />)
  const input = screen.getByTestId('video-file-input')
  expect(input).toHaveAttribute('accept', 'video/mp4,video/webm')
  expect(screen.getByText('MP4 or WebM video')).toBeInTheDocument()
  const f = new File(['x'], 'a.mp4', { type: 'video/mp4' })
  fireEvent.change(input, { target: { files: [f] } })
  expect(u.pick).toHaveBeenCalledWith(f)
  expect(screen.getByTestId('video-publish')).toBeDisabled()
  expect(screen.queryByTestId('video-upload-progress')).toBeNull()
})

it('shows progress and errors, and publishes', () => {
  const file = new File(['x'], 'a.mp4')
  const u = upload({ file, title: 'A', progress: 30, error: 'Bad' })
  const { rerender } = render(<VideoUploadForm u={u} />)
  expect(screen.getByText('a.mp4')).toBeInTheDocument()
  expect(screen.getByTestId('video-upload-progress')).toBeInTheDocument()
  expect(screen.getByTestId('video-upload-error')).toHaveTextContent('Bad')
  fireEvent.click(screen.getByTestId('video-publish'))
  expect(u.submit).toHaveBeenCalled()
  rerender(<VideoUploadForm u={{ ...u, busy: true }} />)
  expect(screen.getByTestId('video-publish')).toHaveTextContent('Uploading')
})
