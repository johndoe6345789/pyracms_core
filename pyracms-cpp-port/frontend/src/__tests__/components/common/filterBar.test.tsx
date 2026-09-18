import { render, screen, fireEvent } from '@testing-library/react'
import SearchFilterBar from '@/components/common/SearchFilterBar'

function setup() {
  const p = { onSearchChange: jest.fn(), onFilterTagChange: jest.fn(),
    onSortByChange: jest.fn() }
  render(<SearchFilterBar search="q" searchPlaceholder="find"
    filterTag="" availableTags={['t1']} sortBy="votes" {...p} />)
  return p
}

describe('SearchFilterBar', () => {
  it('reports search text changes', () => {
    const p = setup()
    fireEvent.change(screen.getByPlaceholderText('find'),
      { target: { value: 'z' } })
    expect(p.onSearchChange).toHaveBeenCalledWith('z')
  })

  it('reports tag and sort selections', () => {
    const p = setup()
    const [tag, sort] = screen.getAllByRole('combobox')
    fireEvent.mouseDown(tag!)
    fireEvent.click(screen.getByRole('option', { name: 't1' }))
    expect(p.onFilterTagChange).toHaveBeenCalledWith('t1')
    fireEvent.mouseDown(sort!)
    fireEvent.click(screen.getByRole('option', { name: 'Newest' }))
    expect(p.onSortByChange).toHaveBeenCalledWith('date')
  })
})
