import { galleryFileUrl } from '@/lib/galleryImage'

describe('galleryFileUrl', () => {
  it('builds file and thumbnail urls', () => {
    expect(galleryFileUrl('a b')).toMatch(/\/api\/files\/a%20b$/)
    expect(galleryFileUrl('u', true)).toMatch(/\/api\/files\/u\/thumbnail$/)
  })
  it('is empty without a uuid', () => {
    expect(galleryFileUrl(undefined)).toBe('')
    expect(galleryFileUrl('')).toBe('')
  })
})
