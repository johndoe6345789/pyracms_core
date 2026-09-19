'use client'

import { Alert, Container, Typography, Divider } from '@mui/material'
import BasicInfoForm from '@/components/gamedep/BasicInfoForm'
import EditRevisionTable from '@/components/gamedep/EditRevisionTable'
import EditActions from '@/components/gamedep/EditActions'
import EditCrumbs from '@/components/gamedep/EditCrumbs'
import SourceUpload from '@/components/gamedep/SourceUpload'
import BinaryUpload from '@/components/gamedep/BinaryUpload'
import { useGameDepEditor } from '@/hooks/useGameDepEditor'
import { useSaveGameDep } from '@/hooks/useSaveGameDep'
import type { GameDepDetailData } from '@/hooks/useGameDepDetail'

interface Props {
  slug: string
  name: string
  detail: GameDepDetailData
}

/** Edit form pre-filled from the loaded dependency. */
export default function DepEditor({ slug, name, detail }: Props) {
  const { saving, error, save } = useSaveGameDep('dep', slug, name)
  const editor = useGameDepEditor(
    detail.displayName,
    detail.description,
    detail.tags,
    detail.revisions,
  )
  const detailHref = `/site/${slug}/dependencies/${name}`

  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <EditCrumbs
        slug={slug}
        detailHref={detailHref}
        displayName={editor.displayName}
      />
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
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} data-testid="save-error">
          {error}
        </Alert>
      )}
      <EditActions
        cancelHref={detailHref}
        saving={saving}
        onSave={() =>
          save({
            displayName: editor.displayName,
            description: editor.description,
            tags: editor.tags,
          })
        }
      />
    </Container>
  )
}
