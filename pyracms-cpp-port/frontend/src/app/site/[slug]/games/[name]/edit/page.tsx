'use client'

import { useParams, useRouter } from 'next/navigation'
import { useState } from 'react'
import { Container, Typography, Box, Button, Breadcrumbs, Divider } from '@mui/material'
import Link from 'next/link'
import { NavigateNextOutlined, SaveOutlined } from '@mui/icons-material'
import BasicInfoForm from '@/components/gamedep/BasicInfoForm'
import EditRevisionTable from '@/components/gamedep/EditRevisionTable'
import SourceUpload from '@/components/gamedep/SourceUpload'
import BinaryUpload from '@/components/gamedep/BinaryUpload'
import { useGameDepEditor } from '@/hooks/useGameDepEditor'
import { GAME_EDIT_REVISIONS } from '@/hooks/data/gamePlaceholders'
import api from '@/lib/api'

export default function EditGamePage() {
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string
  const name = params.name as string
  const [saving, setSaving] = useState(false)
  const editor = useGameDepEditor(
    'Space Blaster',
    'A fast-paced space shooter with procedurally generated levels and power-ups.',
    ['action', 'shooter', 'multiplayer', 'sci-fi'],
    GAME_EDIT_REVISIONS
  )

  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Breadcrumbs separator={<NavigateNextOutlined fontSize="small" />} sx={{ mb: 3 }}>
        <Link href={`/site/${slug}/games`} style={{ color: 'inherit', textDecoration: 'none' }}>Games</Link>
        <Link href={`/site/${slug}/games/${name}`} style={{ color: 'inherit', textDecoration: 'none' }}>{editor.displayName}</Link>
        <Typography color="text.primary">Edit</Typography>
      </Breadcrumbs>

      <Typography variant="h3" component="h1" gutterBottom>Edit Game</Typography>

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
      <BinaryUpload selectedOs={editor.selectedOs} onOsChange={editor.setSelectedOs} selectedArch={editor.selectedArch} onArchChange={editor.setSelectedArch} />
      <Divider sx={{ mb: 4 }} />
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
        <Button variant="outlined" component={Link} href={`/site/${slug}/games/${name}`}>Cancel</Button>
        <Button variant="contained" startIcon={<SaveOutlined />} disabled={saving}
          onClick={() => {
            setSaving(true)
            api.put(`/api/gamedep/game/item/${name}`, {
              displayName: editor.displayName,
              description: editor.description,
              tags: editor.tags,
            })
              .then(() => router.push(`/site/${slug}/games/${name}`))
              .catch(() => {})
              .finally(() => setSaving(false))
          }}>
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </Box>
    </Container>
  )
}
