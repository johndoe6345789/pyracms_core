import { render, screen, fireEvent, act } from '@testing-library/react'
import SearchDialog from '@/components/common/search/SearchDialog'

const push = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push }),
}))
const hook = {
  open: true,
  setOpen: jest.fn(),
  q: 'hello',
  setQ: jest.fn(),
  res: [] as unknown[],
}
jest.mock('@/components/common/search/useGlobalSearch', () => ({
  useGlobalSearch: () => hook,
}))

beforeEach(() => jest.clearAllMocks())

describe('SearchDialog', () => {
  const p = {
    open: true,
    query: 'q',
    results: [],
    onClose: jest.fn(),
    onQueryChange: jest.fn(),
    onSelect: jest.fn(),
    onSearchPage: jest.fn(),
  }

  it('reports typing and Enter, focusing on open', () => {
    jest.useFakeTimers()
    render(<SearchDialog {...p} />)
    act(() => {
      jest.advanceTimersByTime(150)
    })
    const input = screen
      .getByTestId('search-dialog-input')
      .querySelector('input')!
    expect(input).toHaveFocus()
    fireEvent.change(input, { target: { value: 'z' } })
    fireEvent.keyDown(input, { key: 'Enter' })
    fireEvent.keyDown(input, { key: 'a' })
    expect(p.onQueryChange).toHaveBeenCalledWith('z')
    expect(p.onSearchPage).toHaveBeenCalledTimes(1)
    jest.useRealTimers()
  })

  it('ignores Enter without a query', () => {
    render(<SearchDialog {...p} query="" />)
    fireEvent.keyDown(
      screen.getByTestId('search-dialog-input').querySelector('input')!,
      { key: 'Enter' },
    )
    expect(p.onSearchPage).not.toHaveBeenCalled()
  })
})
