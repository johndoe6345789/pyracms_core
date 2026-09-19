import { renderHook, act } from '@testing-library/react'
import { useArticleEditor } from '@/hooks/useArticleEditor'

it('has defaults and parses tags', () => {
  const { result } = renderHook(() => useArticleEditor())
  expect(result.current.renderer).toBe('Markdown')
  act(() => {
    result.current.setTagsInput('a, ,b')
    result.current.setTitle('t')
    result.current.setContent('c')
    result.current.setRenderer('HTML')
    result.current.setSummary('s')
    result.current.setViewMode('preview')
  })
  expect(result.current.parsedTags).toEqual(['a', 'b'])
  expect(result.current.viewMode).toBe('preview')
})

it('uses provided defaults', () => {
  const { result } = renderHook(() =>
    useArticleEditor({
      title: 'T',
      content: 'C',
      renderer: 'BBCode',
      tags: ['x', 'y'],
    }),
  )
  expect(result.current.tagsInput).toBe('x, y')
  expect(result.current.title).toBe('T')
})
