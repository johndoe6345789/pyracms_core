import api from '@/lib/api'
import { attempt } from './pages'
import { emptyOutcome, type SectionDef } from './types'
import {
  albumDetail,
  albumPhotos,
  listAlbums,
  type AlbumRow,
  type Photo,
  type Raw,
} from './albumTypes'

const photo = (p: Raw): Photo => ({
  displayName: p.displayName as string,
  description: (p.description as string) ?? '',
  fileUuid: p.fileUuid as string,
})

async function restoreAlbum(r: AlbumRow, tenantId: number) {
  const find = async () =>
    (await listAlbums(tenantId)).find((a) => a.displayName === r.displayName)
  const old = await find()
  if (!old) await api.post('/api/gallery/albums', { ...r, tenantId })
  const id = (old ?? (await find()))?.id
  const { pictures, coverFileUuid, ...opts } = r
  await api.put(`/api/gallery/albums/${id}`, opts)
  const have = await albumPhotos(id, tenantId)
  for (const p of pictures) {
    if (!have.some((h) => h.fileUuid === p.fileUuid))
      await api.post(`/api/gallery/albums/${id}/pictures`, p)
  }
  if (coverFileUuid && r.coverMode === 'chosen') {
    const c = (await albumPhotos(id, tenantId)).find(
      (h) => h.fileUuid === coverFileUuid,
    )
    if (c) await api.put(`/api/gallery/pictures/${c.id}/default`, {})
  }
  return !old
}

export const albumsSection: SectionDef = {
  key: 'albums',
  label: 'Photo albums',
  description: 'Albums, cover choice and which photos each holds.',
  async collect(tenantId, progress) {
    const rows: AlbumRow[] = []
    for (const a of await listAlbums(tenantId)) {
      progress(`Album ${a.displayName}`)
      const d = await albumDetail(a.id, tenantId)
      rows.push({
        displayName: d.displayName as string,
        description: (d.description as string) ?? '',
        isPrivate: d.isPrivate === true,
        sortOrder: (d.sortOrder as string) || 'newest',
        coverMode: (d.coverMode as string) || 'chosen',
        coverFileUuid: (d.coverFileUuid as string) ?? '',
        pictures: ((d.pictures as Raw[]) ?? []).map(photo),
      })
    }
    return rows
  },
  async restore(rows, tenantId, progress) {
    const out = emptyOutcome()
    for (const r of rows as AlbumRow[]) {
      progress(`Album ${r.displayName}`)
      await attempt(out.failed, r.displayName, async () => {
        if (await restoreAlbum(r, tenantId)) out.created++
        else out.updated++
      })
    }
    return out
  },
}
