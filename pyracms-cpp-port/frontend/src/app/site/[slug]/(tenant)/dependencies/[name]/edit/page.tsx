'use client'

import { useParams, useRouter } from 'next/navigation'
import { useState } from 'react'
import { Container, Typography, Divider } from '@mui/material'
import BasicInfoForm from '@/components/gamedep/BasicInfoForm'
import EditRevisionTable from '@/components/gamedep/EditRevisionTable'
import EditActions from '@/components/gamedep/EditActions'
import EditCrumbs from '@/components/gamedep/EditCrumbs'
import SourceUpload from '@/components/gamedep/SourceUpload'
import BinaryUpload from '@/components/gamedep/BinaryUpload'
import { useGameDepEditor } from '@/hooks/useGameDepEditor'
import { DEP_EDIT_REVISIONS } from '@/hooks/data/depPlaceholders'
import api from '@/lib/api'

const DESCRIPTION =
  'Simple DirectMedia Layer - a cross-platform development library '
  + 'for low level access to audio, keyboard, mouse, joystick, and '
  + 'graphics hardware.'

export default function EditDependencyPage() {
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string
  const name = params.name as string
  const [saving, setSaving] = useState(false)
  const editor = useGameDepEditor(
    'SDL2', DESCRIPTION,
    ['graphics', 'audio', 'utility', 'cross-platform'],
    DEP_EDIT_REVISIONS
  )
  const detailHref = `/site/${slug}/dependencies/${name}`

  const save = () => {
    setSaving(true)
    api.put(`/api/gamedep/dep/item/${name}`, {
      displayName: editor.displayName,
      description: editor.description,
      tags: editor.tags,
    })
      .then(() => router.push(detailHref))
      .catch(() => {})
      .finally(() => setSaving(false))
  }

  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <EditCrumbs slug={slug} detailHref={detailHref}
        displayName={editor.displayName} />
      <Typography variant="h3" component="h1" gutterBottom>
        Edit Dependency
      </Typography>
      <BasicInfoForm
        nameSlug={name}
        displayName={editor.displayName}
        onDisplayNameChange={editor.setDisplayName}
        description={editor.description}
        onDescriptionChange={editor.setDescription}
        tags={editor.tags}
        tagInput={editor.tagInput}
        onTagInputChange={editor.setTagInput}
        onAddTag={editor.handleAddTag}
        onDeleteTag={editor.handleDeleteTag}
      />
      <EditRevisionTable revisions={editor.revisions} />
      <SourceUpload />
      <BinaryUpload
        selectedOs={editor.selectedOs}
        onOsChange={editor.setSelectedOs}
        selectedArch={editor.selectedArch}
        onArchChange={editor.setSelectedArch}
      />
      <Divider sx={{ mb: 4 }} />
      <EditActions cancelHref={detailHref} saving={saving}
        onSave={save} />
    </Container>
  )
}
