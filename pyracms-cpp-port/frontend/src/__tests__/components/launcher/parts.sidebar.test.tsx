import { render, screen, fireEvent } from '@testing-library/react'
import SidebarFilters from '@/components/launcher/SidebarFilters'
import SidebarTags from '@/components/launcher/SidebarTags'
import SidebarList from '@/components/launcher/SidebarList'
import { game } from '../../helpers/launcherParts'

describe('sidebar parts', () => {
  it('reports filter and search changes', () => {
    const onFilter = jest.fn()
    const onSearch = jest.fn()
    render(<SidebarFilters search="" onSearch={onSearch} filter="all"
      onFilter={onFilter} />)
    fireEvent.click(screen.getByText('Installed'))
    expect(onFilter).toHaveBeenCalledWith('installed')
    fireEvent.change(screen.getByLabelText('Search library'),
      { target: { value: 'q' } })
    expect(onSearch).toHaveBeenCalledWith('q')
  })

  it('toggles tags and collapses', () => {
    const onTag = jest.fn()
    const { rerender } = render(<SidebarTags tags={[]} tag="" onTag={onTag} />)
    expect(screen.getByText('No tags yet.')).toBeInTheDocument()
    rerender(<SidebarTags tags={['a']} tag="a" onTag={onTag} />)
    fireEvent.click(screen.getByText('a'))
    expect(onTag).toHaveBeenCalledWith('')
    rerender(<SidebarTags tags={['a']} tag="" onTag={onTag} />)
    fireEvent.click(screen.getByText('a'))
    expect(onTag).toHaveBeenCalledWith('a')
    fireEvent.click(screen.getByText('Categories'))
  })

  it('lists games with marks', () => {
    const onSelect = jest.fn()
    render(<SidebarList games={[game]} selected="g" onSelect={onSelect}
      installed={{ g: '1' }} favs={{ g: '1' }} />)
    expect(screen.getByText('Marked installed v1')).toBeInTheDocument()
    fireEvent.click(screen.getByText('Gee'))
    expect(onSelect).toHaveBeenCalledWith('g')
  })

  it('shows an empty list message', () => {
    render(<SidebarList games={[]} selected={null} onSelect={jest.fn()}
      installed={{}} favs={{}} />)
    expect(screen.getByText('No games match.')).toBeInTheDocument()
  })
})
