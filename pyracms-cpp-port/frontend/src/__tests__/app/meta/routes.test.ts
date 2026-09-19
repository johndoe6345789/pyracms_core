import robots from '@/app/robots'
import sitemap from '@/app/sitemap'

jest.mock('@/lib/siteOrigin', () => ({
  siteOrigin: async () => 'https://site.test',
  serverApiOrigin: () => 'http://api',
}))

const fetchMock = jest.fn()
beforeEach(() => {
  fetchMock.mockReset()
  global.fetch = fetchMock as unknown as typeof fetch
})
const ok = (body: unknown) => ({ ok: true, json: async () => body })

describe('robots', () => {
  it('disallows admin and api and links the sitemap', async () => {
    const r = await robots()
    expect(r.sitemap).toBe('https://site.test/sitemap.xml')
    expect(r.rules).toMatchObject({
      disallow: expect.arrayContaining(['/admin', '/super-admin', '/api/']),
    })
  })
})

describe('sitemap', () => {
  it("lists the home page and every tenant's articles", async () => {
    fetchMock.mockImplementation(async (url: string) => {
      if (url.endsWith('/api/tenants')) {
        return ok([
          { id: 5, slug: 'acme' },
          { id: 6, slug: 'zed' },
        ])
      }
      return ok(
        url.includes('tenant_id=5')
          ? [{ name: 'a b', createdAt: '2024-01-01T00:00:00Z' }]
          : [],
      )
    })
    const s = await sitemap()
    expect(s.map((e) => e.url)).toEqual([
      'https://site.test',
      'https://site.test/site/acme',
      'https://site.test/site/acme/articles/a%20b',
      'https://site.test/site/zed',
    ])
    expect(fetchMock.mock.calls.map((c) => c[0])).toContain(
      'http://api/api/articles?tenant_id=5&limit=100',
    )
  })
  it('returns only home when the api fails', async () => {
    fetchMock.mockResolvedValueOnce({ ok: false })
    expect(await sitemap()).toHaveLength(1)
    fetchMock.mockRejectedValueOnce(new Error('down'))
    expect(await sitemap()).toHaveLength(1)
  })
})
