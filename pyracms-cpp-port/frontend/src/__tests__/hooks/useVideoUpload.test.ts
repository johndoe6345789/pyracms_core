import { act, renderHook } from '@testing-library/react'
import { useVideoUpload } from '@/hooks/useVideoUpload'
import { captureVideoInfo } from '@/lib/videoFrame'
import { publishVideo } from '@/lib/videoPublish'

jest.mock('@/lib/videoFrame', () => ({ captureVideoInfo: jest.fn() }))
jest.mock('@/lib/videoPublish', () => ({ publishVideo: jest.fn() }))
const capture = captureVideoInfo as jest.Mock
const publish = publishVideo as jest.Mock
const INFO = { duration: 9, frame: null }
beforeEach(() => {
  capture.mockReset().mockResolvedValue(INFO)
  publish.mockReset()
})

const mp4 = (name = 'My clip.mp4', type = 'video/mp4') =>
  new File(['x'], name, { type })

it('defaults the title from the file and publishes', async () => {
  publish.mockImplementation(async (_f, _i, _x, _t, onProgress) => {
    onProgress(40)
    return 12
  })
  const done = jest.fn()
  const { result } = renderHook(() => useVideoUpload(3, done))
  act(() => result.current.pick(mp4()))
  expect(result.current.title).toBe('My clip')
  act(() => result.current.setVisibility('private'))
  await act(() => result.current.submit())
  expect(publish).toHaveBeenCalledWith(
    expect.any(File),
    INFO,
    { title: 'My clip', description: '', visibility: 'private' },
    3,
    expect.any(Function),
  )
  expect(result.current.progress).toBe(40)
  expect(done).toHaveBeenCalledWith(12)
})

it('refuses other formats and keeps a typed title', () => {
  const { result } = renderHook(() => useVideoUpload(3, jest.fn()))
  act(() => result.current.pick(mp4('a.avi', 'video/x-msvideo')))
  expect(result.current.error).toBe('Choose an MP4 or WebM video')
  expect(result.current.file).toBeNull()
  act(() => result.current.setTitle('Mine'))
  act(() => result.current.pick(mp4('b.webm', '')))
  act(() => result.current.pick(undefined))
  expect(result.current.title).toBe('Mine')
  expect(result.current.file?.name).toBe('b.webm')
})

it('shows the API error and carries on without capture info', async () => {
  capture.mockRejectedValue(new Error('x'))
  publish.mockRejectedValue({ response: { data: { error: 'Not a video' } } })
  const { result } = renderHook(() => useVideoUpload(3, jest.fn()))
  act(() => result.current.pick(mp4()))
  await act(() => result.current.submit())
  expect(publish.mock.calls[0]?.[1]).toEqual({ duration: 0, frame: null })
  expect(result.current.error).toBe('Not a video')
  expect(result.current.progress).toBeNull()
  expect(result.current.busy).toBe(false)
})

it('does nothing without a file or tenant', async () => {
  const { result } = renderHook(() => useVideoUpload(null, jest.fn()))
  await act(() => result.current.submit())
  act(() => result.current.pick(mp4()))
  await act(() => result.current.submit())
  expect(publish).not.toHaveBeenCalled()
})
