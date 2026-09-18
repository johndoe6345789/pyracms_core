import { render, screen, fireEvent, act } from '@testing-library/react'
import GameActions from '@/components/launcher/GameActions'

const revs = [{ version: '2', published: true, date: 'x' }]
const bins = [{ os: 'windows', arch: 'x64', size: '1', url: 'http://d/x' }]

const base = {
  slug: 's', name: 'n', revisions: revs, binaries: [],
  installedVersion: undefined, onInstalled: jest.fn(),
  onUninstall: jest.fn(),
}

let hrefSet: string[] = []
const realLocation = window.location

beforeAll(() => {
  Object.defineProperty(window, 'location', {
    configurable: true,
    value: { set href(v: string) { hrefSet.push(v) }, get href() { return '' } },
  })
})
afterAll(() => {
  Object.defineProperty(window, 'location', {
    configurable: true, value: realLocation,
  })
})
beforeEach(() => { hrefSet = []; jest.useFakeTimers() })
afterEach(() => jest.useRealTimers())

describe('GameActions', () => {
  it('installs through the deep link with no binary', () => {
    const onInstalled = jest.fn()
    render(<GameActions {...base} onInstalled={onInstalled} />)
    fireEvent.click(screen.getByTestId('primary-action'))
    expect(hrefSet).toEqual(['pyracms://install/s/n'])
    expect(onInstalled).toHaveBeenCalledWith('2')
    expect(screen.getByText(/If nothing opened/)).toBeInTheDocument()
  })

  it('falls back to the binary download', () => {
    Object.defineProperty(navigator, 'userAgent',
      { configurable: true, value: 'Windows NT 10' })
    render(<GameActions {...base} binaries={bins} />)
    fireEvent.click(screen.getByTestId('primary-action'))
    act(() => { jest.advanceTimersByTime(1600) })
    expect(hrefSet).toEqual(['pyracms://install/s/n', 'http://d/x'])
  })

  it('plays when installed and up to date, and can clear the mark', () => {
    const onUninstall = jest.fn()
    render(<GameActions {...base} installedVersion="2"
      onUninstall={onUninstall} />)
    expect(screen.getByText('Play')).toBeInTheDocument()
    fireEvent.click(screen.getByTestId('primary-action'))
    expect(hrefSet).toEqual(['pyracms://launch/s/n'])
    fireEvent.click(screen.getByText('Clear mark'))
    expect(onUninstall).toHaveBeenCalled()
  })

  it('offers an update and disables without revisions', () => {
    const { unmount } = render(<GameActions {...base}
      installedVersion="1" />)
    expect(screen.getByText('Update')).toBeInTheDocument()
    unmount()
    render(<GameActions {...base} revisions={[]} />)
    expect(screen.getByTestId('primary-action')).toBeDisabled()
  })
})
