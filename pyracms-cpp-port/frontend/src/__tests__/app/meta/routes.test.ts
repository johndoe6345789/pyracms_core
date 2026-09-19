import robots from '@/app/robots'
import sitemap from '@/app/sitemap'

const fetchMock = jest.fn()
beforeEach(() => {
  fetchMock.mockReset()
  global.fetch = fetchMock as unknown as typeof fetch
})

describe('robots', () => {
  it('disallows admin and api and links the sitemap', () => {
    const r = robots()
    expect(r.sitemap).toBe('http://localhost:3000/sitemap.xml')
    expect(r.rules).toMatchObject({
      disallow: expect.arrayContaining(['/admin', '/super-admin', '/api/']),
    })
  })
})

describe('sitemap', () => {
  it('lists the home page and articles', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => [{ name: 'a', createdAt: '2024-01-01T00:00:00Z' }],
    })
    const s = await sitemap()
    expect(s).toHaveLength(2)
    expect(s[1]!.url).toBe('http://localhost:3000/site/default/articles/a')
  })
  it('returns only home when the api fails', async () => {
    fetchMock.mockResolvedValueOnce({ ok: false })
    expect(await sitemap()).toHaveLength(1)
    fetchMock.mockRejectedValueOnce(new Error('down'))
    expect(await sitemap()).toHaveLength(1)
  })
})
