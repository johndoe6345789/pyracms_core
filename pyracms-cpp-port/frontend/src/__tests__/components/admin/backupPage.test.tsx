import '../../helpers/scopeModuleMocks'
import {
  renderHook,
  act,
  render,
  screen,
  fireEvent,
  waitFor,
} from '@testing-library/react'
import AdminBackupPage from '@/app/site/[slug]/(admin)/admin/backup/page'
import { useSiteBackup } from '@/hooks/admin/useSiteBackup'
import { m } from '../../helpers/scopeApi'
import { routeGet } from '../../helpers/scopeMocks'

const backup = (sections: object) =>
  JSON.stringify({ format: 'pyracms-backup', version: 2, sections })
const pick = (text: string) =>
  fireEvent.change(screen.getByTestId('import-file-input'), {
    target: { files: [new File([text], 'b.json')] },
  })

beforeEach(() => {
  jest.resetAllMocks()
  URL.createObjectURL = jest.fn(() => 'blob:x')
  URL.revokeObjectURL = jest.fn()
  jest.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation()
  m.put.mockResolvedValue({})
})

it('downloads a backup of the ticked sections', async () => {
  routeGet({ '/api/settings': [{ id: 1, name: 'k', value: 'v' }] })
  render(<AdminBackupPage />)
  for (const l of ['Menus', 'Articles', 'Code snippets', 'Photo albums']) {
    fireEvent.click(screen.getByRole('checkbox', { name: new RegExp(l) }))
  }
  fireEvent.click(screen.getByRole('button', { name: /Download backup/ }))
  await screen.findByText('Backup downloaded.')
  expect(URL.createObjectURL).toHaveBeenCalled()
})

it('previews a backup file and restores what is ticked', async () => {
  render(<AdminBackupPage />)
  pick(backup({ settings: [{ key: 'a', value: 'b' }], menu: [] }))
  await screen.findByText(/Settings & theme \(1\)/)
  const box = (n: RegExp) => screen.getAllByRole('checkbox', { name: n }).pop()!
  expect(box(/Articles/)).toBeDisabled()
  fireEvent.click(box(/Menus/))
  fireEvent.click(screen.getByRole('button', { name: /Restore selected/ }))
  await screen.findByText('Restore finished.')
  expect(screen.getByTestId('restore-report')).toHaveTextContent('1 updated')
  expect(m.put).toHaveBeenCalledTimes(1)
})

it('rejects files that are not backups', async () => {
  render(<AdminBackupPage />)
  pick('not json')
  await screen.findByText(/not a PyraCMS backup/)
  expect(screen.queryByText(/Restore selected/)).toBeNull()
})

it('rejects oversized files', async () => {
  const { result } = renderHook(() => useSiteBackup(1, 's'))
  const big = { size: 60 * 1024 * 1024 } as unknown as File
  await act(() => result.current.load(big))
  expect(result.current.task.error).toMatch(/too big/)
})

it('does nothing until the site has loaded', () => {
  const { result } = renderHook(() => useSiteBackup(null, 's'))
  expect(result.current.exportNow()).toBeUndefined()
  expect(result.current.restoreNow()).toBeUndefined()
})

it('reports a failed export', async () => {
  m.get.mockRejectedValue({ response: { data: { error: 'down' } } })
  render(<AdminBackupPage />)
  fireEvent.click(screen.getByRole('button', { name: /Download backup/ }))
  await waitFor(() => expect(screen.getByText('down')).toBeInTheDocument())
})
