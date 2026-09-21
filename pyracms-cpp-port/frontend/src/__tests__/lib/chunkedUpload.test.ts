import api from '@/lib/api'
import { chunkedUpload } from '@/lib/chunkedUpload'

jest.mock('@/lib/api')
const m = api as jest.Mocked<typeof api>
const file = new File([new Uint8Array(25)], 'a.zip')
const sess = { data: { uploadId: 'u1', partSize: 10, maxParts: 5 } }
const done = { data: { success: true, sha256: 'ab', size: 25 } }

beforeEach(() => {
  jest.resetAllMocks()
  m.post.mockResolvedValueOnce(sess)
  m.delete.mockResolvedValue({})
})

it('uploads parts in order and reports progress', async () => {
  m.put.mockResolvedValue({ data: {} })
  m.post.mockResolvedValueOnce(done)
  const seen: number[] = []
  const r = await chunkedUpload(file, { onProgress: (d) => seen.push(d) })
  expect(r.sha256).toBe('ab')
  const urls = m.put.mock.calls.map((c) => c[0])
  expect(urls).toEqual([
    '/api/files/uploads/u1/parts/1',
    '/api/files/uploads/u1/parts/2',
    '/api/files/uploads/u1/parts/3',
  ])
  expect(seen).toEqual([10, 20, 25])
})

it('retries a failing part', async () => {
  m.put.mockRejectedValueOnce({ response: { status: 503 } })
  m.put.mockResolvedValue({ data: {} })
  m.post.mockResolvedValueOnce(done)
  await chunkedUpload(file, { retryDelayMs: 1 })
  expect(m.put).toHaveBeenCalledTimes(4)
})

it('does not retry a 400 and aborts server side', async () => {
  m.put.mockRejectedValue({ response: { status: 400 } })
  await expect(chunkedUpload(file, { retryDelayMs: 1 })).rejects.toBeDefined()
  expect(m.put).toHaveBeenCalledTimes(1)
  expect(m.delete).toHaveBeenCalledWith('/api/files/uploads/u1')
})

it('calls DELETE when aborted', async () => {
  m.put.mockRejectedValue({ code: 'ERR_CANCELED' })
  await expect(chunkedUpload(file)).rejects.toBeDefined()
  expect(m.delete).toHaveBeenCalledTimes(1)
})

it('surfaces a sha256 mismatch', async () => {
  m.put.mockResolvedValue({ data: {} })
  m.post.mockResolvedValueOnce(done)
  await expect(chunkedUpload(file, { sha256: 'zz' })).rejects.toThrow(
    /mismatch/,
  )
})

it('rejects an invalid partSize', async () => {
  m.post.mockReset()
  m.post.mockResolvedValueOnce({ data: { uploadId: 'u', partSize: 0 } })
  await expect(chunkedUpload(file)).rejects.toThrow(/invalid/)
})
