import { render, screen, fireEvent } from '@testing-library/react'
import GameArt from '@/components/launcher/GameArt'
import BrowseGrid from '@/components/launcher/BrowseGrid'
import GameInfo from '@/components/launcher/GameInfo'
import GameEditCrumbs from '@/components/launcher/GameEditCrumbs'
import GameEditActions from '@/components/launcher/GameEditActions'
import { game, detail } from '../../helpers/launcherParts'

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
