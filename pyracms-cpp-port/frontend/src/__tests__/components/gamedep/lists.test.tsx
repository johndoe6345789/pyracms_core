import { render, screen, fireEvent } from '@testing-library/react'
import DependencyList from '@/components/gamedep/DependencyList'
import GameDepCard from '@/components/gamedep/GameDepCard'
import GameDepGrid from '@/components/gamedep/GameDepGrid'
import RevisionTable from '@/components/gamedep/RevisionTable'
import ScreenshotGrid from '@/components/gamedep/ScreenshotGrid'
import EditRevisionTable from '@/components/gamedep/EditRevisionTable'

const item = {
  name: 'sdl', displayName: 'SDL', description: 'desc', tags: ['t'],
  likes: 5, dislikes: 1, views: 9, created: '2024-01-01',
}
const revs = [
  { version: '1.0', published: true, date: '2024-01-01' },
  { version: '2.0', published: false, date: '2024-02-01' },
]

describe('gamedep lists', () => {
  it('DependencyList handles empty and populated', () => {
    const { rerender } = render(
      <DependencyList dependencies={[]} slug="s" />)
    expect(screen.getByText('No dependencies.')).toBeInTheDocument()
    rerender(<DependencyList slug="s" dependencies={[
      { name: 'm', displayName: 'Math', version: '1' }]} />)
    expect(screen.getByRole('link'))
      .toHaveAttribute('href', '/site/s/dependencies/m')
  })

  it('GameDepCard shows stats', () => {
    render(<GameDepCard item={item} href="/x" />)
    expect(screen.getByText('SDL')).toBeInTheDocument()
    expect(screen.getByText('9')).toBeInTheDocument()
  })

  it('GameDepGrid builds hrefs and forwards hoverColor', () => {
    render(<GameDepGrid items={[item]} hrefPrefix="/p"
      hoverColor="red" />)
    expect(screen.getByRole('link')).toHaveAttribute('href', '/p/sdl')
  })

  it('GameDepGrid works without hoverColor', () => {
    render(<GameDepGrid items={[item]} hrefPrefix="/p" />)
    expect(screen.getByText('desc')).toBeInTheDocument()
  })

  it('RevisionTable labels published and draft', () => {
    render(<RevisionTable revisions={revs} />)
    expect(screen.getByText('Published')).toBeInTheDocument()
    expect(screen.getByText('Draft')).toBeInTheDocument()
  })

  it('ScreenshotGrid renders images', () => {
    render(<ScreenshotGrid screenshots={[
      { id: '1', src: '/a.png', title: 'A' }]} />)
    expect(screen.getByAltText('A')).toHaveAttribute('src', '/a.png')
  })

  it('EditRevisionTable fires create and delete', () => {
    const [c, d] = [jest.fn(), jest.fn()]
    render(<EditRevisionTable revisions={revs} onCreateRevision={c}
      onDeleteRevision={d} />)
    fireEvent.click(screen.getByText('Create Revision'))
    fireEvent.click(screen.getByLabelText('Delete 2.0'))
    expect(c).toHaveBeenCalled()
    expect(d).toHaveBeenCalledWith('2.0')
  })

  it('EditRevisionTable tolerates missing callbacks', () => {
    render(<EditRevisionTable revisions={revs} />)
    fireEvent.click(screen.getByText('Create Revision'))
    fireEvent.click(screen.getByLabelText('Delete 1.0'))
  })
})
