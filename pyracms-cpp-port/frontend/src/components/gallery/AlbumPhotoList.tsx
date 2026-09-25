'use client'

import { useState } from 'react'
import { List, Paper, Typography } from '@mui/material'
import AlbumPhotoRow from './AlbumPhotoRow'
import GalleryDeleteDialog from './GalleryDeleteDialog'
import GalleryEditDialog from './GalleryEditDialog'
import type { GalleryPicture } from '@/hooks/useGalleryAlbum'
import type { useAlbumEdit } from '@/hooks/useAlbumEdit'

interface Props {
  pictures: GalleryPicture[]
  coverId: number
  edit: ReturnType<typeof useAlbumEdit>
}

/** Every photo in the album, each with edit, delete and set-as-cover. */
export default function AlbumPhotoList({ pictures, coverId, edit }: Props) {
  const [editing, setEditing] = useState<GalleryPicture | null>(null)
  const [title, setTitle] = useState('')
  const [desc, setDesc] = useState('')
  const [deleting, setDeleting] = useState<GalleryPicture | null>(null)

  return (
    <Paper variant="outlined" sx={{ mb: 3 }}>
      <Typography variant="h6" component="h2" sx={{ p: 2, pb: 0 }}>
        Photos ({pictures.length})
      </Typography>
      {pictures.length === 0 && (
        <Typography color="text.secondary" sx={{ p: 2 }}>
          No photos yet. Upload some from the album page.
        </Typography>
      )}
      <List data-testid="photo-list">
        {pictures.map((pic) => (
          <AlbumPhotoRow
            key={pic.id}
            picture={pic}
            isCover={Number(pic.id) === coverId}
            disabled={edit.busy}
            onSetCover={() => edit.setCover(pic.id)}
            onEdit={() => {
              setEditing(pic)
              setTitle(pic.title)
              setDesc(pic.description)
            }}
            onDelete={() => setDeleting(pic)}
          />
        ))}
      </List>
      <GalleryEditDialog
        open={!!editing}
        noun="photo"
        name={title}
        desc={desc}
        busy={edit.busy}
        err={null}
        setName={setTitle}
        setDesc={setDesc}
        onClose={() => setEditing(null)}
        onSave={() => {
          if (editing) edit.editPicture(editing.id, title.trim(), desc)
          setEditing(null)
        }}
      />
      <GalleryDeleteDialog
        open={!!deleting}
        noun="photo"
        name={deleting?.title ?? ''}
        albums={false}
        busy={edit.busy}
        err={null}
        onClose={() => setDeleting(null)}
        onConfirm={() => {
          if (deleting) edit.removePicture(deleting.id)
          setDeleting(null)
        }}
      />
    </Paper>
  )
}
