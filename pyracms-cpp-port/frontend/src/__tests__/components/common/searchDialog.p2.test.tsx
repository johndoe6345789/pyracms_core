import { render, screen, fireEvent } from '@testing-library/react'
import { GlobalSearch } from '@/components/common/search'

const push = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push }),
}))
let hook = {
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

const r = (id: string, type: string, snippet = 's') =>
  ({ id, type, title: `T${id}`, snippet, url: `/u/${id}` }) as never

describe('GlobalSearch', () => {
  it('opens on click and routes selections', () => {
    render(<GlobalSearch />)
    fireEvent.click(screen.getByTestId('global-search-trigger'))
    expect(hook.setOpen).toHaveBeenCalledWith(true)
    fireEvent.keyDown(
      screen.getByTestId('search-dialog-input').querySelector('input')!,
      { key: 'Enter' },
    )
    expect(push).toHaveBeenCalledWith('/search?q=hello')
  })

  it('routes a picked result', () => {
    hook = { ...hook, res: [r('7', 'post')] }
    render(<GlobalSearch />)
    fireEvent.click(screen.getByTestId('search-result-7'))
    expect(push).toHaveBeenCalledWith('/u/7')
  })
})
