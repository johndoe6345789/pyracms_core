'use client'

import { useState } from 'react'
import PictureFooter from './PictureFooter'
import GalleryManageDialogs, { type ManageDialog }
  from './GalleryManageDialogs'
import { useCanManage } from '@/hooks/useCanManage'
import type { PictureData } from '@/hooks/useGalleryPicture'

interface Props {
  slug: string
  pictureId: string
  picture: PictureData
  onLike: () => void
  onDislike: () => void
  onSetCover: () => void
  onChanged: () => void
  onDeleted: () => void
}

/** Votes plus owner/admin edit and delete (with confirmation). */
export default function ManagedPictureFooter(p: Props) {
  const [dialog, setDialog] = useState<ManageDialog>(null)
  const canManage = useCanManage(p.slug, p.picture.ownerId)
  return (
    <>
      <PictureFooter likes={p.picture.likes} dislikes={p.picture.dislikes}
        onLike={p.onLike} onDislike={p.onDislike}
        onSetCover={p.onSetCover} canManage={canManage}
        onEdit={() => setDialog('edit')}
        onDelete={() => setDialog('delete')} />
      <GalleryManageDialogs
        key={`${p.picture.title}|${p.picture.description}`}
        kind="pictures" id={p.pictureId} name={p.picture.title}
        description={p.picture.description} open={dialog}
        onClose={() => setDialog(null)} onChanged={p.onChanged}
        onDeleted={p.onDeleted} />
    </>
  )
}
