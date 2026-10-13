import api from '@/lib/api'
import { uploadFileAuto } from '@/lib/uploadFileAuto'
import { publishVideo, uploadThumbnail } from '@/lib/videoPublish'
import { asMockApi } from '../helpers/mockApi'

jest.mock('@/lib/api', () => ({
  __esModule: true,
  default: { post: jest.fn() },
}))
jest.mock('@/lib/uploadFileAuto', () => ({ uploadFileAuto: jest.fn() }))
const m = asMockApi<'post'>(api)
const up = uploadFileAuto as jest.Mock
beforeEach(() => {
  m.post.mockReset()
  up.mockReset()
})

const file = new File(['x'], 'a.mp4', { type: 'video/mp4' })
const fields = { title: ' Cat ', description: 'd', visibility: 'unlisted' }

it('uploads video and still, then creates the video', async () => {
  up.mockImplementationOnce(async (_f, o) => {
    o.onProgress(50, 100)
    o.onProgress(0, 0)
    return { uuid: 'v1' }
  }).mockResolvedValueOnce({ uuid: 't1' })
  m.post.mockResolvedValue({ data: { id: 12 } })
  const progress = jest.fn()
  const info = { duration: 61.6, frame: new Blob(['p']) }
  const id = await publishVideo(file, info, fields as never, 3, progress)
  expect(id).toBe(12)
  expect(progress).toHaveBeenCalledWith(50)
  expect(progress).toHaveBeenCalledWith(0)
  const thumb = up.mock.calls[1]?.[0] as File
  expect(thumb.type).toBe('image/png')
  expect(m.post).toHaveBeenCalledWith('/api/videos', {
    tenantId: 3,
    title: 'Cat',
    description: 'd',
    fileUuid: 'v1',
    thumbnailUuid: 't1',
    durationSeconds: 62,
    visibility: 'unlisted',
  })
})

describe('uploadThumbnail', () => {
  it('is empty without a frame or when the upload fails', async () => {
    expect(await uploadThumbnail(null, 3)).toBe('')
    up.mockRejectedValueOnce(new Error('x'))
    expect(await uploadThumbnail(new Blob(['p']), 3)).toBe('')
    up.mockResolvedValueOnce({})
    expect(await uploadThumbnail(new Blob(['p']), 3)).toBe('')
  })
})
