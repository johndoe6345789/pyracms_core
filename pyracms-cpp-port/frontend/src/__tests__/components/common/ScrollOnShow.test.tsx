import { render, screen } from '@testing-library/react'
import { ScrollOnShow } from '@/components/common/ScrollOnShow'

it('scrolls its content into view when it appears and when it changes', () => {
  const scroll = jest.fn()
  window.HTMLElement.prototype.scrollIntoView = scroll
  const { rerender } = render(
    <ScrollOnShow trigger="a">
      <p>output</p>
    </ScrollOnShow>,
  )
  expect(screen.getByText('output')).toBeInTheDocument()
  expect(scroll).toHaveBeenCalledTimes(1)
  rerender(
    <ScrollOnShow trigger="a">
      <p>output</p>
    </ScrollOnShow>,
  )
  expect(scroll).toHaveBeenCalledTimes(1)
  rerender(
    <ScrollOnShow trigger="b">
      <p>output</p>
    </ScrollOnShow>,
  )
  expect(scroll).toHaveBeenCalledTimes(2)
})
