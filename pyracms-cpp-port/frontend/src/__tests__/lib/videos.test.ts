import {
  channelHref,
  videoListParams,
  videosHref,
  watchHref,
} from '@/lib/videos'

describe('videoListParams', () => {
  it('always sends tenant, limit and offset', () => {
    expect(videoListParams(3, {}, 0)).toBe('tenant_id=3&limit=24&offset=0')
  })

  it('adds user, trimmed search and sort', () => {
    const p = new URLSearchParams(
      videoListParams(3, { userId: 9, q: ' cat ', sort: 'popular' }, 24),
    )
    expect(p.get('user_id')).toBe('9')
    expect(p.get('q')).toBe('cat')
    expect(p.get('sort')).toBe('popular')
    expect(p.get('offset')).toBe('24')
  })

  it('skips a blank search and honours the limit', () => {
    const p = new URLSearchParams(videoListParams(3, { q: ' ', limit: 10 }, 0))
    expect(p.has('q')).toBe(false)
    expect(p.get('limit')).toBe('10')
  })
})

it('builds the module links', () => {
  expect(videosHref('s')).toBe('/site/s/videos')
  expect(watchHref('s', 4)).toBe('/site/s/videos/watch/4')
  expect(channelHref('s', 2)).toBe('/site/s/videos/channel/2')
})
