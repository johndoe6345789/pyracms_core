import { render, screen } from '@testing-library/react'
import { Provider } from 'react-redux'
import { makeStore } from '@/store/store'
import DownloadPage from '@/app/download/page'
import SiteDownloadPage from '@/app/site/[slug]/(tenant)/download/page'
import { pickRelease } from '@/lib/release'
import { RAW_RELEASES } from '../../helpers/releaseFixture'

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn(), replace: jest.fn() }),
  useParams: () => ({}),
  usePathname: () => '/download',
}))
const mockState = jest.fn()
jest.mock('@/hooks/useLauncherRelease', () => ({
  useLauncherRelease: () => mockState(),
  usePlatform: () => ({ os: 'lin', arch: 'x86_64' }),
}))

const ready = { status: 'ready', release: pickRelease(RAW_RELEASES) }

describe('download pages', () => {
  it('portal /download has chrome, ribbon and footer', () => {
    mockState.mockReturnValue(ready)
    render(<Provider store={makeStore().store}><DownloadPage /></Provider>)
    expect(screen.getByTestId('download-page')).toBeInTheDocument()
    expect(screen.getByTestId('dl-primary'))
      .toHaveTextContent('for Linux (x86_64)')
    expect(screen.getByTestId('fork-ribbon')).toBeInTheDocument()
    expect(screen.getByTestId('site-footer')).toBeInTheDocument()
    expect(screen.getByTestId('get-launcher')).toHaveAttribute(
      'href', '/download')
  })

  it('site page renders just the content', () => {
    mockState.mockReturnValue({ status: 'fallback' })
    render(<SiteDownloadPage />)
    expect(screen.getByTestId('dl-fallback')).toBeInTheDocument()
    expect(screen.queryByTestId('site-footer')).toBeNull()
  })
})
