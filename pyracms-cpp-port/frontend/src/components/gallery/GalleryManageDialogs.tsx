'use client'

import { useState } from 'react'
import { Alert } from '@mui/material'
import GalleryDeleteDialog from './GalleryDeleteDialog'
import GalleryEditDialog from './GalleryEditDialog'
import { useGalleryManage } from '@/hooks/useGalleryManage'

export type ManageDialog = 'edit' | 'delete' | null

interface Props {
  kind: 'albums' | 'pictures'
  id: string
  name: string
  description: string
  open: ManageDialog
  onClose: () => void
  onChanged: () => void
  onDeleted: () => void
}

/** Edit form and delete confirmation for an album or picture. */
export default function GalleryManageDialogs(p: Props) {
  const g = useGalleryManage(p.kind, p.id)
  const [name, setName] = useState(p.name)
  const [desc, setDesc] = useState(p.description)
  const noun = p.kind === 'albums' ? 'album' : 'picture'
  const close = () => {
    g.clearError()
    p.onClose()
  }
  const err = g.error && (
    <Alert severity="error" sx={{ mt: 1 }} data-testid="gallery-manage-error">
      {g.error}
    </Alert>
  )
  return (
    <>
      <GalleryEditDialog
        open={p.open === 'edit'}
        noun={noun}
        name={name}
        desc={desc}
        busy={g.busy}
        err={err}
        setName={setName}
        setDesc={setDesc}
        onClose={close}
        onSave={() =>
          g.update(name.trim(), desc, () => {
            p.onClose()
            p.onChanged()
          })
        }
      />
      <GalleryDeleteDialog
        open={p.open === 'delete'}
        noun={noun}
        name={p.name}
        albums={p.kind === 'albums'}
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
