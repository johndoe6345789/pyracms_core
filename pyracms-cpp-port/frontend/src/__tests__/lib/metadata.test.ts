import { generateArticleMetadata, fetchArticleJsonLd } from '@/lib/metadata'
import { tenantIdOf } from '@/lib/siteOrigin'

jest.mock('@/lib/siteOrigin', () => ({
  tenantIdOf: jest.fn(),
  siteOrigin: async () => 'https://site.test',
  serverApiOrigin: () => 'http://api',
}))

const fetchMock = jest.fn()
beforeEach(() => {
  fetchMock.mockReset()
  ;(tenantIdOf as jest.Mock).mockResolvedValue(2)
  global.fetch = fetchMock as unknown as typeof fetch
})

const ok = (body: unknown) => ({ ok: true, json: async () => body })

describe('generateArticleMetadata', () => {
  it('maps open graph fields for the slug tenant', async () => {
    fetchMock.mockResolvedValue(ok({
      'og:title': 'T', 'og:description': 'D', 'og:url': 'http://u',
      'article:published_time': 'P', 'article:author': 'A',
    }))
    const m = await generateArticleMetadata('s', 'n')
    expect(tenantIdOf).toHaveBeenCalledWith('s')
    expect(fetchMock.mock.calls[0][0]).toBe(
      'http://api/api/articles/n/opengraph?tenant_id=2'
      + '&base_url=https%3A%2F%2Fsite.test%2Fsite%2Fs')
    expect(m.title).toBe('T')
    expect(m.openGraph).toMatchObject({ url: 'http://u', authors: ['A'] })
  })
  it('falls back to defaults', async () => {
    fetchMock.mockResolvedValue(ok({}))
    const m = await generateArticleMetadata('s', 'n')
    expect(m.title).toBe('n')
    expect(m.openGraph).toMatchObject({
      url: 'https://site.test/site/s/articles/n',
    })
  })
  it('uses the name when the site is unknown', async () => {
    ;(tenantIdOf as jest.Mock).mockResolvedValue(null)
    expect(await generateArticleMetadata('s', 'n')).toEqual({ title: 'n' })
    expect(fetchMock).not.toHaveBeenCalled()
  })
  it('returns empty on http error and name on throw', async () => {
    fetchMock.mockResolvedValueOnce({ ok: false })
    expect(await generateArticleMetadata('s', 'n')).toEqual({})
    fetchMock.mockRejectedValueOnce(new Error('x'))
    expect(await generateArticleMetadata('s', 'n')).toEqual({ title: 'n' })
  })
})

describe('fetchArticleJsonLd', () => {
  it('returns json, null on error, null on throw', async () => {
    fetchMock.mockResolvedValueOnce(ok({ a: 1 }))
    expect(await fetchArticleJsonLd('s', 'n')).toEqual({ a: 1 })
    expect(fetchMock.mock.calls[0][0]).toContain('/n/jsonld?tenant_id=2')
    fetchMock.mockResolvedValueOnce({ ok: false })
    expect(await fetchArticleJsonLd('s', 'n')).toBeNull()
    fetchMock.mockRejectedValueOnce(new Error('x'))
    expect(await fetchArticleJsonLd('s', 'n')).toBeNull()
    ;(tenantIdOf as jest.Mock).mockResolvedValue(null)
    expect(await fetchArticleJsonLd('s', 'n')).toBeNull()
  })
})
