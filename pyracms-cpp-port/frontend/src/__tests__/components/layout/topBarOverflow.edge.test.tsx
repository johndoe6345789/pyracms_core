import { render, screen } from '@testing-library/react'
import TopBarLinks from '@/components/layout/TopBarLinks'
import {
  fitLinks as links,
  layout,
  observers,
  stubLayout,
} from '../../helpers/fitLayout'

beforeAll(stubLayout)
beforeEach(() => {
  observers.length = 0
})

const shown = () => screen.queryAllByRole('link').length

describe('TopBarLinks edge cases', () => {
  it('does not measure a row that is not displayed', () => {
    layout.rowWidth = 0
    render(<TopBarLinks items={links(6)} pathname="/" />)
    expect(shown()).toBe(6)
  })

  it('starts again when the links change', () => {
    layout.rowWidth = 800
    const { rerender } = render(<TopBarLinks items={links(6)} pathname="/" />)
    layout.rowWidth = 300
    rerender(<TopBarLinks items={links(5)} pathname="/" />)
    expect(shown()).toBe(1)
  })

  it('marks More active when the current page is folded into it', () => {
    layout.rowWidth = 500
    render(<TopBarLinks items={links(6)} pathname="/l5" />)
    expect(screen.getByTestId('nav-more')).toBeInTheDocument()
    expect(shown()).toBe(3)
  })
})
