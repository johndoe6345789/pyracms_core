import { act, render, screen } from '@testing-library/react'
import TopBarLinks from '@/components/layout/TopBarLinks'

let rowWidth = 500
const observers: (() => void)[] = []

beforeAll(() => {
  // jsdom lays nothing out: every row is `rowWidth` wide, every link 100px
  Object.defineProperty(HTMLElement.prototype, 'clientWidth', {
    configurable: true,
    get: () => rowWidth,
  })
  Object.defineProperty(HTMLElement.prototype, 'offsetWidth', {
    configurable: true,
    get: () => 100,
  })
  global.ResizeObserver = class {
    constructor(cb: () => void) {
      observers.push(cb)
    }
    observe() {}
    disconnect() {}
  } as unknown as typeof ResizeObserver
})

beforeEach(() => {
  observers.length = 0
})

const links = (n: number) =>
  Array.from({ length: n }, (_, i) => ({
    key: `k${i}`,
    label: `Link ${i}`,
    href: `/l${i}`,
    icon: null,
  }))
const shown = () => screen.queryAllByRole('link').length

describe('TopBarLinks fits its space', () => {
  it('shows every link when they fit', () => {
    rowWidth = 800
    render(<TopBarLinks items={links(6)} pathname="/" />)
    expect(shown()).toBe(6)
    expect(screen.queryByTestId('nav-more')).toBeNull()
  })

  it('folds what does not fit into More', () => {
    rowWidth = 500 // 6 x 104 = 624 > 500; More takes 96: 3 links stay
    render(<TopBarLinks items={links(6)} pathname="/" />)
    expect(shown()).toBe(3)
    expect(screen.getByTestId('nav-more')).toHaveTextContent('More')
  })

  it('brings links back when the window grows, and folds them when it shrinks', () => {
    rowWidth = 500
    render(<TopBarLinks items={links(6)} pathname="/" />)
    expect(shown()).toBe(3)
    rowWidth = 900
    act(() => observers.forEach((cb) => cb()))
    expect(shown()).toBe(6)
    expect(screen.queryByTestId('nav-more')).toBeNull()
    rowWidth = 300
    act(() => observers.forEach((cb) => cb()))
    expect(shown()).toBe(1)
  })

  it('does not measure a row that is not displayed', () => {
    rowWidth = 0
    render(<TopBarLinks items={links(6)} pathname="/" />)
    expect(shown()).toBe(6)
  })

  it('starts again when the links change', () => {
    rowWidth = 800
    const { rerender } = render(<TopBarLinks items={links(6)} pathname="/" />)
    rowWidth = 300
    rerender(<TopBarLinks items={links(5)} pathname="/" />)
    expect(shown()).toBe(1)
  })
})
