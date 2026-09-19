import { render, screen, fireEvent } from '@testing-library/react'
import GameActions from '@/components/launcher/GameActions'
import { base, hrefs, stubGameActionsEnv } from '../../helpers/gameActionsEnv'

stubGameActionsEnv()

describe('GameActions', () => {
  it('plays when installed and up to date, and can clear the mark', () => {
    const onUninstall = jest.fn()
    render(
      <GameActions {...base} installedVersion="2" onUninstall={onUninstall} />,
    )
    expect(screen.getByText('Play')).toBeInTheDocument()
    fireEvent.click(screen.getByTestId('primary-action'))
    expect(hrefs.list).toEqual(['pyracms://launch/s/n'])
    fireEvent.click(screen.getByText('Clear mark'))
    expect(onUninstall).toHaveBeenCalled()
  })

  it('offers an update and disables without revisions', () => {
    const { unmount } = render(<GameActions {...base} installedVersion="1" />)
    expect(screen.getByText('Update')).toBeInTheDocument()
    unmount()
    render(<GameActions {...base} revisions={[]} />)
    expect(screen.getByTestId('primary-action')).toBeDisabled()
  })
})
