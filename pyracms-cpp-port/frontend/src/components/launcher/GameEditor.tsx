'use client'

import { Alert, Container, Typography, Divider } from '@mui/material'
import BasicInfoForm from '@/components/gamedep/BasicInfoForm'
import EditRevisionTable from '@/components/gamedep/EditRevisionTable'
import SourceUpload from '@/components/gamedep/SourceUpload'
import BinaryUpload from '@/components/gamedep/BinaryUpload'
import GameEditCrumbs from '@/components/launcher/GameEditCrumbs'
import GameEditActions from '@/components/launcher/GameEditActions'
import { useGameDepEditor } from '@/hooks/useGameDepEditor'
import { useSaveGame } from '@/hooks/useSaveGame'
import type { GameDepDetailData } from '@/hooks/useGameDepDetail'

interface Props {
  slug: string
  name: string
  detail: GameDepDetailData
}

/** Edit form pre-filled from the loaded game. */
export default function GameEditor({ slug, name, detail }: Props) {
  const { saving, error, save } = useSaveGame(slug, name)
  const editor = useGameDepEditor(
    detail.displayName,
    detail.description,
    detail.tags,
    detail.revisions,
  )

  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <GameEditCrumbs
        slug={slug}
        name={name}
        displayName={editor.displayName}
      />
      <Typography variant="h3" component="h1" gutterBottom>
        Edit Game
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
      <GameEditActions
        cancelHref={`/site/${slug}/games/${name}`}
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
