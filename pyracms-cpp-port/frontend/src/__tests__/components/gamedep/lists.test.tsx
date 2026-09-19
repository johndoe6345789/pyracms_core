import { render, screen } from '@testing-library/react'
import DependencyList from '@/components/gamedep/DependencyList'
import GameDepCard from '@/components/gamedep/GameDepCard'
import GameDepGrid from '@/components/gamedep/GameDepGrid'
import { item } from '../../helpers/gamedepListFixtures'

describe('gamedep lists', () => {
  it('DependencyList handles empty and populated', () => {
    const { rerender } = render(<DependencyList dependencies={[]} slug="s" />)
    expect(screen.getByText('No dependencies.')).toBeInTheDocument()
    rerender(
      <DependencyList
        slug="s"
        dependencies={[{ name: 'm', displayName: 'Math', version: '1' }]}
      />,
    )
    expect(screen.getByRole('link')).toHaveAttribute(
      'href',
      '/site/s/dependencies/m',
    )
  })

  it('GameDepCard shows stats', () => {
    render(<GameDepCard item={item} href="/x" />)
    expect(screen.getByText('SDL')).toBeInTheDocument()
    expect(screen.getByText('9')).toBeInTheDocument()
  })

  it('GameDepGrid builds hrefs and forwards hoverColor', () => {
    render(<GameDepGrid items={[item]} hrefPrefix="/p" hoverColor="red" />)
    expect(screen.getByRole('link')).toHaveAttribute('href', '/p/sdl')
  })

  it('GameDepGrid works without hoverColor', () => {
    render(<GameDepGrid items={[item]} hrefPrefix="/p" />)
    expect(screen.getByText('desc')).toBeInTheDocument()
  })
})
