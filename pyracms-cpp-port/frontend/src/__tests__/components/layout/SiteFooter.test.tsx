import { render, screen } from '@testing-library/react'
import SiteFooter from '@/components/layout/SiteFooter'

it('links the site contact email only when one is set', () => {
  const { rerender } = render(<SiteFooter />)
  expect(screen.queryByTestId('footer-contact')).toBeNull()
  rerender(<SiteFooter contactEmail="a@b.test" />)
  expect(screen.getByTestId('footer-contact')).toHaveAttribute(
    'href',
    'mailto:a@b.test',
  )
})
