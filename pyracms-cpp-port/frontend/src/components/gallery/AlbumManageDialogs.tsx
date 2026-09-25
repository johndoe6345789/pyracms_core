'use client'

import { useState } from 'react'
import { Alert } from '@mui/material'
import AlbumEditDialog, { type AlbumForm } from './AlbumEditDialog'
import GalleryDeleteDialog from './GalleryDeleteDialog'
import type { ManageDialog } from './GalleryManageDialogs'
import { useGalleryManage } from '@/hooks/useGalleryManage'
import type { AlbumOptions, GalleryPicture } from '@/hooks/useGalleryAlbum'

interface Props {
  id: string
  name: string
  description: string
  options: AlbumOptions
  pictures: GalleryPicture[]
  open: ManageDialog
  onClose: () => void
  onChanged: () => void
  onDeleted: () => void
}

/** Edit form (all album options) and delete confirmation for an album. */
export default function AlbumManageDialogs(p: Props) {
  const g = useGalleryManage('albums', p.id)
  const [form, setForm] = useState<AlbumForm>({
    ...p.options,
    name: p.name,
    desc: p.description,
  })
  const close = () => {
    g.clearError()
    p.onClose()
  }
  const err = g.error && (
    <Alert severity="error" sx={{ mt: 1 }} data-testid="gallery-manage-error">
      {g.error}
    </Alert>
  )
  const save = () =>
    g.updateAlbum(
      {
        displayName: form.name.trim(),
        description: form.desc,
        isPrivate: form.isPrivate,
        sortOrder: form.sortOrder,
        defaultPictureId: form.coverPictureId,
      },
      () => {
        p.onClose()
        p.onChanged()
      },
    )
  return (
    <>
      <AlbumEditDialog
        open={p.open === 'edit'}
        form={form}
        pictures={p.pictures}
        busy={g.busy}
        err={err}
        onChange={setForm}
        onClose={close}
        onSave={save}
      />
      <GalleryDeleteDialog
        open={p.open === 'delete'}
        noun="album"
        name={p.name}
        albums
        busy={g.busy}
        err={err}
        onClose={close}
        onConfirm={() =>
          g.remove(() => {
            p.onClose()
            p.onDeleted()
          })
        }
      />
    </>
  )
}
