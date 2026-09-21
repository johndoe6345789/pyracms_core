import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import BinaryUpload from '@/components/gamedep/BinaryUpload'
import SourceUpload from '@/components/gamedep/SourceUpload'
import { uploadFileAuto } from '@/lib/uploadFileAuto'

jest.mock('@/lib/uploadFileAuto')
const up = uploadFileAuto as jest.Mock
const file = new File(['abc'], 'g.zip')

function pick(label: string) {
  const input = screen.getByText(label).querySelector('input')!
  fireEvent.change(input, { target: { files: [file] } })
}

it('SourceUpload shows accessible progress', async () => {
  up.mockImplementation(async (_f, o) => {
    o.onProgress(1, 4)
    await new Promise(() => undefined)
  })
  render(<SourceUpload />)
  pick('Select Source Archive')
  const bar = await screen.findByRole('progressbar')
  expect(bar).toHaveAttribute('aria-valuenow', '25')
})

it('BinaryUpload shows progress then success', async () => {
  up.mockImplementation(async (_f, o) => {
    o.onProgress(2, 4)
    return { filename: 'g.zip' }
  })
  const noop = jest.fn()
  render(
    <BinaryUpload
      selectedOs="Linux"
      onOsChange={noop}
      selectedArch="x64"
      onArchChange={noop}
    />,
  )
  pick('Select Binary')
  await waitFor(() => screen.getByText('Uploaded g.zip'))
})

it('shows an error when the upload fails', async () => {
  up.mockRejectedValue({ response: { data: { error: 'sha mismatch' } } })
  render(<SourceUpload />)
  pick('Select Source Archive')
  await waitFor(() => screen.getByText('sha mismatch'))
})
