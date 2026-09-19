import { render, screen, fireEvent } from '@testing-library/react'
import FacetSidebar from '@/components/search/FacetSidebar'
import { highlightMatch } from '@/components/search/highlightMatch'
import { TYPE_CONFIG } from '@/components/search/facetConfig'

describe('highlightMatch', () => {
  it('wraps matches in mark and escapes regex chars', () => {
    expect(highlightMatch('a.b a.b', 'a.b')).toBe(
      '<mark>a.b</mark> <mark>a.b</mark>',
    )
  })

  it('sanitizes markup even without a highlight', () => {
    expect(highlightMatch('<img src=x onerror=alert(1)>hi', '')).not.toContain(
      'onerror',
    )
  })

  it('strips scripts when highlighting', () => {
    expect(highlightMatch('<script>x</script>ok', 'ok')).toBe('<mark>ok</mark>')
  })
})

describe('FacetSidebar', () => {
  it('switches type and disables empty facets', () => {
    const onType = jest.fn()
    render(
      <FacetSidebar
        facets={{ article: 3 }}
        activeType="all"
        onTypeChange={onType}
        totalCount={3}
      />,
    )
    fireEvent.click(screen.getByText('Articles'))
    expect(onType).toHaveBeenCalledWith('article')
    fireEvent.click(screen.getByText('All'))
    expect(onType).toHaveBeenCalledWith('all')
    expect(
      screen.getByText('Snippets').closest('[role=button]'),
    ).toHaveAttribute('aria-disabled', 'true')
    expect(Object.keys(TYPE_CONFIG)).toHaveLength(4)
  })
})
