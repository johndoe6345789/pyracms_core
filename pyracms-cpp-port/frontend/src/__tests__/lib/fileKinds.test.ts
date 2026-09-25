import { canView, extensionOf, fileKind } from '@/lib/fileKinds'

it('tells kinds by extension, then by content type', () => {
  expect(fileKind('a.PNG')).toBe('image')
  expect(fileKind('run.py')).toBe('code')
  expect(fileKind('x.7z')).toBe('archive')
  expect(fileKind('data.csv')).toBe('data')
  expect(fileKind('game.apk')).toBe('package')
  expect(fileKind('route.cdp')).toBe('other')
  expect(fileKind('noext', 'video/mp4')).toBe('video')
  expect(fileKind('noext', 'audio/ogg')).toBe('audio')
  expect(fileKind('noext', 'application/pdf')).toBe('pdf')
  expect(fileKind('noext', 'text/plain')).toBe('text')
  expect(fileKind('noext', 'application/zip')).toBe('archive')
  expect(fileKind('noext')).toBe('other')
})

it('only offers View for what the server will open', () => {
  for (const ok of ['a.png', 'b.PDF', 'c.py', 'd.mp4', 'e.txt', 'f.json'])
    expect(canView(ok)).toBe(true)
  for (const no of ['a.zip', 'b.exe', 'c.svg', 'd.html', 'e', 'f.cdp'])
    expect(canView(no)).toBe(false)
  expect(extensionOf('a.tar.GZ')).toBe('gz')
})
