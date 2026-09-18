import { render, screen, fireEvent } from '@testing-library/react'
import GameArt from '@/components/launcher/GameArt'
import BrowseGrid from '@/components/launcher/BrowseGrid'
import GameInfo from '@/components/launcher/GameInfo'
import GameEditCrumbs from '@/components/launcher/GameEditCrumbs'
import GameEditActions from '@/components/launcher/GameEditActions'
import LibraryHeader from '@/components/launcher/LibraryHeader'
import SidebarFilters from '@/components/launcher/SidebarFilters'
import SidebarTags from '@/components/launcher/SidebarTags'
import SidebarList from '@/components/launcher/SidebarList'
import VersionSelect from '@/components/launcher/VersionSelect'
import PrimaryActionButton from '@/components/launcher/PrimaryActionButton'
import SampleNotice from '@/components/launcher/SampleNotice'
import { actionState } from '@/components/launcher/gameActionState'

const game = {
  name: 'g', displayName: 'Gee', description: 'd', tags: [], likes: 0,
  dislikes: 0, views: 1500, created: '2024-01-01',
}
const detail = {
  ...game, owner: 'o', revisions: [
    { version: '2', published: true, date: 'x' },
    { version: '1', published: false, date: 'y' }],
  binaries: [], dependencies: [], screenshots: [],
}

describe('GameArt / BrowseGrid', () => {
  it('shows an initial or an image', () => {
    const { rerender } = render(<GameArt name="g" label="Zed" height={10} />)
    expect(screen.getByTestId('game-art')).toHaveTextContent('Z')
    rerender(<GameArt name="g" label="Zed" image="/i.png" height={10} />)
    expect(screen.getByTestId('game-art')).toHaveTextContent('')
  })

  it('selects a game and shows an empty state', () => {
    const onSelect = jest.fn()
    const { rerender } = render(<BrowseGrid games={[game]}
      onSelect={onSelect} />)
    fireEvent.click(screen.getByText('Gee'))
    expect(onSelect).toHaveBeenCalledWith('g')
    expect(screen.getByText('1,500 views')).toBeInTheDocument()
    rerender(<BrowseGrid games={[]} onSelect={onSelect} />)
    expect(screen.getByText('No games match.')).toBeInTheDocument()
  })
})

describe('GameInfo', () => {
  it('renders empty sections', () => {
    render(<GameInfo detail={detail as never} slug="s" />)
    expect(screen.getByText('Latest v2')).toBeInTheDocument()
    expect(screen.getByText('None listed.')).toBeInTheDocument()
  })

  it('renders deps, screenshots and no-latest', () => {
    const d = {
      ...detail, description: '', created: '', revisions: [],
      dependencies: [{ name: 'dp', displayName: 'Dep', version: '1' }],
      screenshots: [{ id: 1, src: '/s.png', title: 'shot' }],
    }
    render(<GameInfo detail={d as never} slug="s" />)
    expect(screen.getByText('Latest n/a')).toBeInTheDocument()
    expect(screen.getByText('Dep 1').closest('a'))
      .toHaveAttribute('href', '/site/s/dependencies/dp')
    expect(screen.getByAltText('shot')).toBeInTheDocument()
    expect(screen.getByText('No description yet.')).toBeInTheDocument()
  })
})

describe('edit page parts', () => {
  it('links the crumbs', () => {
    render(<GameEditCrumbs slug="s" name="n" displayName="N!" />)
    expect(screen.getByText('N!').closest('a'))
      .toHaveAttribute('href', '/site/s/games/n')
  })

  it('saves and reflects saving', () => {
    const onSave = jest.fn()
    const { rerender } = render(<GameEditActions cancelHref="/c"
      saving={false} onSave={onSave} />)
    fireEvent.click(screen.getByText('Save Changes'))
    expect(onSave).toHaveBeenCalled()
    rerender(<GameEditActions cancelHref="/c" saving onSave={onSave} />)
    expect(screen.getByText('Saving...').closest('button')).toBeDisabled()
  })
})

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

describe('header and actions', () => {
  it('switches views and opens the mobile drawer', () => {
    const onView = jest.fn()
    const onOpen = jest.fn()
    render(<LibraryHeader mobile view="browse" onView={onView}
      onOpenDrawer={onOpen} />)
    fireEvent.click(screen.getByText('Library'))
    expect(onView).toHaveBeenCalledWith('library')
    fireEvent.click(screen.getByLabelText('Open library'))
    expect(onOpen).toHaveBeenCalled()
  })

  it('has no mobile button on desktop', () => {
    render(<LibraryHeader mobile={false} view="browse"
      onView={jest.fn()} onOpenDrawer={jest.fn()} />)
    expect(screen.queryByLabelText('Open library')).toBeNull()
  })

  it('renders each primary label', () => {
    const { rerender } = render(<PrimaryActionButton label="Update"
      disabled={false} onClick={jest.fn()} />)
    expect(screen.getByText('Update')).toBeInTheDocument()
    rerender(<PrimaryActionButton label="Play" disabled onClick={jest.fn()} />)
    expect(screen.getByTestId('primary-action')).toBeDisabled()
  })

  it('lists versions', () => {
    render(<VersionSelect versions={detail.revisions} value="2"
      onChange={jest.fn()} />)
    expect(screen.getByText('v2')).toBeInTheDocument()
  })

  it('shows the sample notice', () => {
    render(<SampleNotice />)
    expect(screen.getByText(/sample entries/)).toBeInTheDocument()
  })
})

describe('actionState', () => {
  it('picks the action', () => {
    expect(actionState(detail.revisions, undefined).label).toBe('Install')
    expect(actionState(detail.revisions, '1').label).toBe('Update')
    expect(actionState(detail.revisions, '2').label).toBe('Play')
    const unpublished = [{ version: '9', published: false, date: '' }]
    expect(actionState(unpublished, undefined).latest).toBe('9')
    expect(actionState([], undefined).latest).toBe('')
  })
})
