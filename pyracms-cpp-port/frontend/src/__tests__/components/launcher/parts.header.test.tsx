import { render, screen, fireEvent } from '@testing-library/react'
import LibraryHeader from '@/components/launcher/LibraryHeader'
import VersionSelect from '@/components/launcher/VersionSelect'
import PrimaryActionButton from '@/components/launcher/PrimaryActionButton'
import SampleNotice from '@/components/launcher/SampleNotice'
import { actionState } from '@/components/launcher/gameActionState'
import { detail } from '../../helpers/launcherParts'

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
