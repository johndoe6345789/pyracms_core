import { apiOrigin, wsUrl } from '@/lib/apiOrigin'

const OLD = process.env.NEXT_PUBLIC_API_URL
afterEach(() => {
  if (OLD === undefined) delete process.env.NEXT_PUBLIC_API_URL
  else process.env.NEXT_PUBLIC_API_URL = OLD
})

describe('apiOrigin', () => {
  it('uses the configured API URL when set', () => {
    process.env.NEXT_PUBLIC_API_URL = 'https://api.example.com'
    expect(apiOrigin()).toBe('https://api.example.com')
  })

  it('falls back to the page origin, never localhost:8080', () => {
    delete process.env.NEXT_PUBLIC_API_URL
    expect(apiOrigin()).toBe(window.location.origin)
    expect(apiOrigin()).not.toContain('8080')
  })

  it('treats an empty API URL like an unset one', () => {
    process.env.NEXT_PUBLIC_API_URL = ''
    expect(apiOrigin()).toBe(window.location.origin)
  })
})

describe('wsUrl', () => {
  it('uses ws for http and wss for https origins', () => {
    process.env.NEXT_PUBLIC_API_URL = 'http://h.test'
    expect(wsUrl('/api/ws/notifications')).toBe(
      'ws://h.test/api/ws/notifications',
    )
    process.env.NEXT_PUBLIC_API_URL = 'https://h.test'
    expect(wsUrl('/api/ws/collab')).toBe('wss://h.test/api/ws/collab')
  })
})
