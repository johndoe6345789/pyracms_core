import { buildBackup, parseBackup } from '@/lib/backup/format'
import { runBackup, runRestore } from '@/lib/backup/run'
import { m } from '../../helpers/scopeApi'

jest.mock(
  '@/lib/api',
  () => jest.requireActual('../../helpers/apiMock').apiMock,
)

const noop = () => {}

it('round-trips a current backup and drops unknown sections', () => {
  const file = buildBackup({ settings: [{ key: 'a', value: 'b' }] })
  const back = parseBackup(
    JSON.stringify({ ...file, sections: { ...file.sections, junk: [1] } }),
  )
  expect(back.sections).toEqual({ settings: [{ key: 'a', value: 'b' }] })
  expect(back.exportedAt).toBe(file.exportedAt)
})

it('reads the old settings export', () => {
  const old = { exportType: 'settings', data: { site_name: 'X', n: 3 } }
  expect(parseBackup(JSON.stringify(old)).sections.settings).toEqual([
    { key: 'site_name', value: 'X' },
    { key: 'n', value: '3' },
  ])
  const none = { exportType: 'settings', data: null }
  expect(parseBackup(JSON.stringify(none)).sections.settings).toEqual([])
})

it('reads the old menus export', () => {
  const old = {
    exportType: 'menus',
    data: [
      { name: 'main', items: [{ name: 'Home', route: '/', position: 1 }] },
    ],
  }
  expect(parseBackup(JSON.stringify(old)).sections.menu).toEqual([
    {
      name: 'Home',
      route: '/',
      position: 1,
      type: 'route',
      parent: '',
      icon: '',
      group: 'main',
    },
  ])
  expect(parseBackup('{"exportType":"menus","data":1}').sections.menu).toEqual(
    [],
  )
})

it('refuses files that are not backups', () => {
  expect(() => parseBackup('{"exportType":"weird"}')).toThrow()
  expect(() => parseBackup('{"a":1}')).toThrow()
  expect(() => parseBackup('null')).toThrow()
  expect(() => parseBackup('nope')).toThrow()
})

it('backs up and restores only the chosen sections', async () => {
  m.get.mockResolvedValue({ data: [{ id: 1, name: 'k', value: 'v' }] })
  m.put.mockResolvedValue({})
  const file = await runBackup(['settings'], 4, noop)
  expect(Object.keys(file.sections)).toEqual(['settings'])
  const report = await runRestore(file, ['settings', 'snippets'], 4, noop)
  expect(report.settings?.updated).toBe(1)
  expect(report.snippets).toMatchObject({ created: 0, updated: 0 })
})
