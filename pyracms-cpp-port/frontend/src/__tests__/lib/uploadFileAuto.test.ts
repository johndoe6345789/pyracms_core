import api from '@/lib/api'
import { uploadFileAuto } from '@/lib/uploadFileAuto'

jest.mock('@/lib/api')
const m = api as jest.Mocked<typeof api>
beforeEach(() => jest.resetAllMocks())

it('uses multipart POST /api/files for small files', async () => {
  m.post.mockResolvedValue({ data: { success: true, uuid: 'x' } })
  const r = await uploadFileAuto(new File(['hi'], 'a.txt'), { tenantId: 3 })
  expect(r.uuid).toBe('x')
  const [url, form] = m.post.mock.calls[0]!
  expect(url).toBe('/api/files')
  expect((form as FormData).get('tenant_id')).toBe('3')
  expect(m.put).not.toHaveBeenCalled()
})

it('uses the chunked flow from 40 MB', async () => {
  const big = new File(['x'], 'big.bin')
  Object.defineProperty(big, 'size', { value: 41 * 1024 * 1024 })
  m.post.mockResolvedValue({ data: { uploadId: '', partSize: 1 } })
  await expect(uploadFileAuto(big)).rejects.toThrow(/invalid/)
  expect(m.post.mock.calls[0]![0]).toBe('/api/files/uploads')
})
