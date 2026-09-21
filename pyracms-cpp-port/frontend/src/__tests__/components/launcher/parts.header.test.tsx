import { render, screen, fireEvent } from '@testing-library/react'
import LibraryHeader from '@/components/launcher/LibraryHeader'
import VersionSelect from '@/components/launcher/VersionSelect'
import PrimaryActionButton from '@/components/launcher/PrimaryActionButton'
import { actionState } from '@/components/launcher/gameActionState'
import { detail } from '../../helpers/launcherParts'

describe('header and actions', () => {
  it('reports filter, search and tag changes', () => {
    const p = {
      search: '',
      onSearch: jest.fn(),
      filter: 'all' as const,
      onFilter: jest.fn(),
      tags: ['arcade'],
      tag: '',
      onTag: jest.fn(),
    }
    render(<LibraryHeader {...p} />)
    fireEvent.click(screen.getByText('Favourites'))
    expect(p.onFilter).toHaveBeenCalledWith('favourites')
    fireEvent.click(screen.getByText('arcade'))
    expect(p.onTag).toHaveBeenCalledWith('arcade')
    fireEvent.change(screen.getByLabelText('Search games'), {
      target: { value: 'pong' },
    })
    expect(p.onSearch).toHaveBeenCalledWith('pong')
  })

  it('renders each primary label', () => {
    const { rerender } = render(
      <PrimaryActionButton
        label="Update"
        disabled={false}
        onClick={jest.fn()}
      />,
    )
    expect(screen.getByText('Update')).toBeInTheDocument()
    rerender(<PrimaryActionButton label="Play" disabled onClick={jest.fn()} />)
    expect(screen.getByTestId('primary-action')).toBeDisabled()
  })

  it('lists versions', () => {
    render(
      <VersionSelect
        versions={detail.revisions}
        value="2"
        onChange={jest.fn()}
      />,
    )
    expect(screen.getByText('v2')).toBeInTheDocument()
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
