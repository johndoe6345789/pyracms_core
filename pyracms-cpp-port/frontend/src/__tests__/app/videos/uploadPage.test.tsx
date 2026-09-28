import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import UploadPage from '@/app/site/[slug]/(tenant)/videos/upload/page'
import { publishVideo } from '@/lib/videoPublish'
import { push, state } from '../../helpers/videoPagesMocks'

function mockH() {
  return jest.requireActual('../../helpers/videoPagesMocks')
}
jest.mock('next/navigation', () => mockH().navMock)
jest.mock('@/hooks/useTenantId', () => mockH().tenantMock)
jest.mock('@/hooks/useSiteSession', () => mockH().sessionMock)
jest.mock('@/lib/videoFrame', () => ({
  captureVideoInfo: () => Promise.resolve({ duration: 3, frame: null }),
}))
jest.mock('@/lib/videoPublish', () => ({ publishVideo: jest.fn() }))

it('asks guests to sign in', () => {
  state.signedIn = false
  render(<UploadPage />)
  expect(screen.getByTestId('video-upload-signin')).toBeInTheDocument()
  expect(screen.getByRole('link', { name: 'Sign in' })).toHaveAttribute(
    'href',
    '/auth/login?tenant=s',
  )
  state.signedIn = true
})

it('uploads, publishes and opens the watch page', async () => {
  ;(publishVideo as jest.Mock).mockResolvedValue(15)
  render(<UploadPage />)
  const f = new File(['x'], 'holiday.webm', { type: 'video/webm' })
  fireEvent.change(screen.getByTestId('video-file-input'), {
    target: { files: [f] },
  })
  expect(screen.getByTestId('video-title-input')).toHaveValue('holiday')
  fireEvent.click(screen.getByTestId('video-publish'))
  await waitFor(() =>
    expect(push).toHaveBeenCalledWith('/site/s/videos/watch/15'),
  )
})
