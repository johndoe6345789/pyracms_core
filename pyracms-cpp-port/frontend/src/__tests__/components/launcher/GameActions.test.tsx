import { render, screen, fireEvent, act } from '@testing-library/react'
import GameActions from '@/components/launcher/GameActions'
import {
  base,
  bins,
  hrefs,
  stubGameActionsEnv,
} from '../../helpers/gameActionsEnv'

stubGameActionsEnv()

describe('GameActions', () => {
  it('installs through the deep link with no binary', () => {
    const onInstalled = jest.fn()
    render(<GameActions {...base} onInstalled={onInstalled} />)
    fireEvent.click(screen.getByTestId('primary-action'))
    expect(hrefs.list).toEqual(['pyracms://install/s/n'])
    expect(onInstalled).toHaveBeenCalledWith('2')
    expect(screen.getByText(/If nothing opened/)).toBeInTheDocument()
  })

  it('falls back to the binary download', () => {
    Object.defineProperty(navigator, 'userAgent', {
      configurable: true,
      value: 'Windows NT 10',
    })
    render(<GameActions {...base} binaries={bins} />)
    fireEvent.click(screen.getByTestId('primary-action'))
    act(() => {
      jest.advanceTimersByTime(1600)
    })
    expect(hrefs.list).toEqual(['pyracms://install/s/n', 'http://d/x'])
  })
})
