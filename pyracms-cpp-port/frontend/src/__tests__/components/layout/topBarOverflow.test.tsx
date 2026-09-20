import { act, render, screen } from '@testing-library/react'
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

describe('TopBarLinks fits its space', () => {
  it('shows every link when they fit', () => {
    layout.rowWidth = 800
    render(<TopBarLinks items={links(6)} pathname="/" />)
    expect(shown()).toBe(6)
    expect(screen.queryByTestId('nav-more')).toBeNull()
  })

  it('folds what does not fit into More', () => {
    layout.rowWidth = 500 // 6 x 104 > 500; More takes 96: 3 links stay
    render(<TopBarLinks items={links(6)} pathname="/" />)
    expect(shown()).toBe(3)
    expect(screen.getByTestId('nav-more')).toHaveTextContent('More')
  })

  it('follows the window as it grows and shrinks', () => {
    layout.rowWidth = 500
    render(<TopBarLinks items={links(6)} pathname="/" />)
    expect(shown()).toBe(3)
    layout.rowWidth = 900
    act(() => observers.forEach((cb) => cb()))
    expect(shown()).toBe(6)
    expect(screen.queryByTestId('nav-more')).toBeNull()
    layout.rowWidth = 300
    act(() => observers.forEach((cb) => cb()))
    expect(shown()).toBe(1)
  })
})
