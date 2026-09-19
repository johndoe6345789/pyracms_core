import { render, screen } from '@testing-library/react'
import ForkRibbon from '@/components/common/ForkRibbon'
import SiteFooter from '@/components/layout/SiteFooter'
import GetLauncherLink from '@/components/launcher/GetLauncherLink'
import HeroLauncherButton from '@/components/portal/HeroLauncherButton'

const REPO = 'https://github.com/johndoe6345789/pyracms_core'

describe('ForkRibbon', () => {
  it('is an accessible external corner link', () => {
    render(<ForkRibbon />)
    const a = screen.getByLabelText('Fork me on GitHub')
    expect(a).toHaveAttribute('href', REPO)
    expect(a).toHaveAttribute('rel', 'noopener noreferrer')
    expect(a).toHaveAttribute('target', '_blank')
  })
  it('has an inline variant and honours a repo override', () => {
    render(<ForkRibbon variant="inline" repo="a/b" />)
    expect(screen.getByTestId('fork-inline'))
      .toHaveAttribute('href', 'https://github.com/a/b')
  })
})

describe('SiteFooter', () => {
  it('links launcher, releases, repo, docs and license', () => {
    render(<SiteFooter downloadHref="/site/x/download" />)
    expect(screen.getByTestId('footer-download'))
      .toHaveAttribute('href', '/site/x/download')
    expect(screen.getByText('Releases')).toHaveAttribute(
      'href', `${REPO}/releases`)
    expect(screen.getByText('GitHub')).toHaveAttribute('href', REPO)
    expect(screen.getByText('Docs')).toBeInTheDocument()
    expect(screen.getByText('License')).toBeInTheDocument()
    expect(screen.getByTestId('fork-inline')).toBeInTheDocument()
  })
  it('defaults to the portal download page', () => {
    render(<SiteFooter />)
    expect(screen.getByTestId('footer-download'))
      .toHaveAttribute('href', '/download')
  })
})

describe('launcher links', () => {
  it('banner and hero button point at the download page', () => {
    render(<><GetLauncherLink href="/site/x/download" />
      <HeroLauncherButton /></>)
    expect(screen.getByText('Need Hypernucleus?')).toBeInTheDocument()
    expect(screen.getByTestId('get-launcher-link'))
      .toHaveAttribute('href', '/site/x/download')
    expect(screen.getByTestId('hero-download-button'))
      .toHaveAttribute('href', '/download')
  })
})
