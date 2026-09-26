import api from '@/lib/api'

export interface Photo {
  displayName: string
  description: string
  fileUuid: string
}

export interface AlbumRow {
  displayName: string
  description: string
  isPrivate: boolean
  sortOrder: string
  coverMode: string
  /** file uuid of the chosen cover, '' when none */
  coverFileUuid: string
  pictures: Photo[]
}

export type Raw = Record<string, unknown>

export const listAlbums = (tenantId: number) =>
  api
    .get('/api/gallery/albums', { params: { tenant_id: tenantId } })
    .then((r) => (Array.isArray(r.data) ? (r.data as Raw[]) : []))

export const albumDetail = (id: unknown, tenantId: number) =>
  api
    .get(`/api/gallery/albums/${id}`, { params: { tenant_id: tenantId } })
    .then((r) => r.data as Raw)

/** The photos an album holds now. */
export const albumPhotos = async (id: unknown, tenantId: number) =>
  ((await albumDetail(id, tenantId)).pictures ?? []) as Raw[]
