'use client'

import { useParams } from 'next/navigation'
import { Container, Typography, Divider } from '@mui/material'
import BasicInfoForm from '@/components/gamedep/BasicInfoForm'
import EditRevisionTable from '@/components/gamedep/EditRevisionTable'
import SourceUpload from '@/components/gamedep/SourceUpload'
import BinaryUpload from '@/components/gamedep/BinaryUpload'
import GameEditCrumbs from '@/components/launcher/GameEditCrumbs'
import GameEditActions from '@/components/launcher/GameEditActions'
import { useGameDepEditor } from '@/hooks/useGameDepEditor'
import { useSaveGame } from '@/hooks/useSaveGame'
import { GAME_EDIT_REVISIONS } from '@/hooks/data/gamePlaceholders'

const INITIAL_DESCRIPTION =
  'A fast-paced space shooter with procedurally generated levels ' +
  'and power-ups.'

export default function EditGamePage() {
  const params = useParams()
  const slug = params.slug as string
  const name = params.name as string
  const { saving, save } = useSaveGame(slug, name)
  const editor = useGameDepEditor(
    'Space Blaster',
    INITIAL_DESCRIPTION,
    ['action', 'shooter', 'multiplayer', 'sci-fi'],
    GAME_EDIT_REVISIONS,
  )

  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <GameEditCrumbs
        slug={slug} name={name} displayName={editor.displayName}
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
      <GameEditActions
        cancelHref={`/site/${slug}/games/${name}`}
        saving={saving}
        onSave={() => save({
          displayName: editor.displayName,
          description: editor.description,
          tags: editor.tags,
        })}
      />
    </Container>
  )
}
