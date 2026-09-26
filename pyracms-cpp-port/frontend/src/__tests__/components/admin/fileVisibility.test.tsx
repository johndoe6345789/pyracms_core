import '../../helpers/scopeModuleMocks'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import FileCard from '@/components/admin/FileCard'
import { mapFileRecord, type FileItem } from '@/hooks/admin/fileData'
import { m } from '../../helpers/scopeApi'

const file = (visibility: 'public' | 'authenticated'): FileItem => ({
  id: 1,
  name: 'pic.png',
  size: 10,
  type: 'image/png',
  downloads: 0,
  uploadedAt: '2024-01-01',
  uuid: 'u-vis',
  visibility,
})

beforeEach(() => {
  jest.resetAllMocks()
  m.put.mockResolvedValue({})
})

it('reads visibility from the API, public when missing', () => {
  const rec = { id: 1, uuid: 'u' }
  expect(mapFileRecord(rec).visibility).toBe('public')
  expect(
    mapFileRecord({ ...rec, visibility: 'authenticated' }).visibility,
  ).toBe('authenticated')
})

it('a public file opens straight away and offers to lock it', () => {
  const onVisibility = jest.fn()
  render(
    <FileCard
      file={file('public')}
      onDelete={jest.fn()}
      onVisibility={onVisibility}
    />,
  )
  expect(screen.getByTestId('visibility-1')).toHaveTextContent('Public')
  expect(screen.getByTestId('download-file-1').getAttribute('href')).toMatch(
    /\/api\/files\/u-vis$/,
  )
  fireEvent.click(screen.getByTestId('visibility-btn-1'))
  expect(onVisibility).toHaveBeenCalledWith(file('public'), 'authenticated')
  expect(m.post).not.toHaveBeenCalled()
})

it('an authenticated-only file opens with a signed link', async () => {
  const onVisibility = jest.fn()
  m.post.mockResolvedValue({
    data: { query: 'exp=9999999999&sig=abc', exp: 9999999999 },
  })
  render(
    <FileCard
      file={file('authenticated')}
      onDelete={jest.fn()}
      onVisibility={onVisibility}
    />,
  )
  expect(screen.getByTestId('visibility-1')).toHaveTextContent(
    'Authenticated only',
  )
  // no preview until the signed link is there
  expect(screen.queryByTestId('file-thumb-u-vis')).toBeNull()
  await waitFor(() =>
    expect(screen.getByTestId('download-file-1').getAttribute('href')).toMatch(
      /u-vis\?exp=9999999999&sig=abc$/,
    ),
  )
  expect(screen.getByTestId('file-thumb-u-vis').getAttribute('src')).toMatch(
    /thumbnail\?exp=/,
  )
  fireEvent.click(screen.getByTestId('visibility-btn-1'))
  expect(onVisibility).toHaveBeenCalledWith(file('authenticated'), 'public')
})
