import { render, screen, fireEvent } from '@testing-library/react'
import RevisionTable from '@/components/gamedep/RevisionTable'
import ScreenshotGrid from '@/components/gamedep/ScreenshotGrid'
import EditRevisionTable from '@/components/gamedep/EditRevisionTable'
import { revs } from '../../helpers/gamedepListFixtures'

describe('gamedep lists', () => {
  it('RevisionTable labels published and draft', () => {
    render(<RevisionTable revisions={revs} />)
    expect(screen.getByText('Published')).toBeInTheDocument()
    expect(screen.getByText('Draft')).toBeInTheDocument()
  })

  it('ScreenshotGrid renders images', () => {
    render(
      <ScreenshotGrid screenshots={[{ id: '1', src: '/a.png', title: 'A' }]} />,
    )
    expect(screen.getByAltText('A')).toHaveAttribute('src', '/a.png')
  })

  it('EditRevisionTable fires create and delete', () => {
    const [c, d] = [jest.fn(), jest.fn()]
    render(
      <EditRevisionTable
        revisions={revs}
        onCreateRevision={c}
        onDeleteRevision={d}
      />,
    )
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
