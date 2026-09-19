import { render, screen } from '@testing-library/react'
import DownloadHero from '@/components/download/DownloadHero'
import PlatformTable from '@/components/download/PlatformTable'
import InstallNotes from '@/components/download/InstallNotes'
import { pickRelease } from '@/lib/release'
import { RAW_RELEASES } from '../../helpers/releaseFixture'

const release = pickRelease(RAW_RELEASES)!
const win = { os: 'win', arch: 'x86_64' } as const

describe('DownloadHero', () => {
  it('shows a loading note', () => {
    render(<DownloadHero state={{ status: 'loading' }} platform={win} />)
    expect(screen.getByTestId('dl-loading')).toBeInTheDocument()
  })

  it('offers the build for the detected platform', () => {
    render(<DownloadHero state={{ status: 'ready', release }}
      platform={win} />)
    const b = screen.getByTestId('dl-primary')
    expect(b).toHaveTextContent('Download Hypernucleus for Windows (x86_64)')
    expect(b).toHaveAttribute('href', expect.stringContaining('win-x86_64'))
  })

  it('asks the visitor to pick when the OS is unknown', () => {
    render(<DownloadHero state={{ status: 'ready', release }}
      platform={{ os: null, arch: 'x86_64' }} />)
    expect(screen.getByTestId('dl-no-match')).toBeInTheDocument()
  })

  it('falls back to the Releases page', () => {
    render(<DownloadHero state={{ status: 'fallback' }} platform={win} />)
    expect(screen.getByTestId('dl-fallback')).toHaveTextContent(/unreachable/)
    expect(screen.getByText('Releases')).toHaveAttribute(
      'href', 'https://github.com/johndoe6345789/pyracms_core/releases')
  })

  it('falls back when the release has no binaries', () => {
    const empty = { ...release, assets: [] }
    render(<DownloadHero state={{ status: 'ready', release: empty }}
      platform={win} />)
    expect(screen.getByTestId('dl-fallback')).toHaveTextContent(/no launcher/)
  })
})

describe('PlatformTable', () => {
  it('lists every build with size and checksum', () => {
    render(<PlatformTable release={release} />)
    expect(screen.getByTestId('dl-row-win-x86_64'))
      .toHaveTextContent('a'.repeat(64))
    expect(screen.getByTestId('dl-row-mac-arm64'))
      .toHaveTextContent('see SHA256SUMS')
    expect(screen.getAllByText('5.0 MB')).toHaveLength(3)
    expect(screen.getByText('SHA256SUMS')).toHaveAttribute('href')
  })
  it('omits the SHA256SUMS link when absent', () => {
    render(<PlatformTable release={{ ...release, sumsUrl: undefined }} />)
    expect(screen.queryByText('SHA256SUMS')).toBeNull()
  })
})

describe('InstallNotes', () => {
  it('explains unsigned builds and the deep link', () => {
    render(<InstallNotes />)
    expect(screen.getByText(/SmartScreen/)).toBeInTheDocument()
    expect(screen.getByText(/Gatekeeper/)).toBeInTheDocument()
    expect(screen.getByTestId('dl-deeplink')).toHaveTextContent('pyracms://')
  })
})
