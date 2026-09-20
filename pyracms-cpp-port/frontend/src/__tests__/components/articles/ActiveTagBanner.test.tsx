import { render, screen } from '@testing-library/react'
import { ActiveTagBanner } from '@/components/articles/ActiveTagBanner'

describe('ActiveTagBanner', () => {
  it('shows nothing without a tag', () => {
    render(<ActiveTagBanner slug="demo" tag="" />)
    expect(screen.queryByTestId('active-tag')).toBeNull()
  })

  it('names the tag and links back to every article', () => {
    render(<ActiveTagBanner slug="demo" tag="test" />)
    expect(screen.getByText('Tagged: test')).toBeInTheDocument()
    expect(screen.getByRole('link')).toHaveAttribute(
      'href',
      '/site/demo/articles',
    )
  })
})
