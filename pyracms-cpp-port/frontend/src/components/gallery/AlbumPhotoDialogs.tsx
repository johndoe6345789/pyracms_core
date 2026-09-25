'use client'

import GalleryDeleteDialog from './GalleryDeleteDialog'
import GalleryEditDialog from './GalleryEditDialog'
import type { GalleryPicture } from '@/hooks/useGalleryAlbum'
import type { useAlbumEdit } from '@/hooks/useAlbumEdit'

interface Props {
  editing: GalleryPicture | null
  deleting: GalleryPicture | null
  title: string
  desc: string
  setTitle: (v: string) => void
  setDesc: (v: string) => void
  edit: ReturnType<typeof useAlbumEdit>
  onCloseEdit: () => void
  onCloseDelete: () => void
}

/** The edit-photo form and the delete-photo confirmation. */
export default function AlbumPhotoDialogs(p: Props) {
  const { edit } = p
  return (
    <>
      <GalleryEditDialog
        open={!!p.editing}
        noun="photo"
        name={p.title}
        desc={p.desc}
        busy={edit.busy}
        err={null}
        setName={p.setTitle}
        setDesc={p.setDesc}
        onClose={p.onCloseEdit}
        onSave={() => {
          if (p.editing) edit.editPicture(p.editing.id, p.title.trim(), p.desc)
          p.onCloseEdit()
        }}
      />
      <GalleryDeleteDialog
        open={!!p.deleting}
        noun="photo"
        name={p.deleting?.title ?? ''}
        albums={false}
        busy={edit.busy}
        err={null}
        onClose={p.onCloseDelete}
        onConfirm={() => {
          if (p.deleting) edit.removePicture(p.deleting.id)
          p.onCloseDelete()
        }}
      />
    </>
  )
}
