import { formatForumDate } from '@/lib/forumDate'
import {
  isRunnable, langColor, mapRunResult, mapSnippet,
} from '@/lib/snippets'

describe('formatForumDate', () => {
  it('formats ISO timestamps', () => {
    expect(formatForumDate('2024-05-01T10:30:45Z')).toBe('2024-05-01 10:30')
  })
  it('returns empty string for missing values', () => {
    expect(formatForumDate(null)).toBe('')
    expect(formatForumDate(undefined)).toBe('')
  })
})

describe('snippet helpers', () => {
  it('knows runnable languages', () => {
    expect(isRunnable('python')).toBe(true)
    expect(isRunnable('css')).toBe(false)
  })
  it('picks a language colour with fallback', () => {
    expect(langColor('rust')).toBe('#dea584')
    expect(langColor('zzz')).toBe('#6e7681')
  })
  it('maps a raw snippet with defaults', () => {
    const s = mapSnippet({ id: 3, createdAt: '2024-01-02T03:04:05Z' })
    expect(s).toMatchObject({
      id: '3', title: '', language: 'plaintext', author: 'Unknown',
      date: '2024-01-02', runCount: 0, visibility: 'public',
    })
  })
  it('maps a full raw snippet', () => {
    const s = mapSnippet({
      id: 1, title: 'T', language: 'go', code: 'x', authorUsername: 'bob',
      authorId: 4, runCount: 2, forkedFrom: 9, visibility: 'private',
    })
    expect(s.author).toBe('bob')
    expect(s.forkedFrom).toBe(9)
  })
  it('maps a successful run', () => {
    expect(mapRunResult({ output: 'hi', exitCode: 0, executionTimeMs: 5 }))
      .toEqual({ stdout: 'hi', stderr: '', exitCode: 0, executionTime: 5 })
  })
  it('routes failing output to stderr', () => {
    expect(mapRunResult({ output: 'boom', exitCode: 1 }))
      .toEqual({ stdout: '', stderr: 'boom', exitCode: 1 })
  })
})
