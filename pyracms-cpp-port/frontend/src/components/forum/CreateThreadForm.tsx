'use client'

import { Box, TextField, Button, Alert } from '@mui/material'
import { SendOutlined } from '@mui/icons-material'
import Link from 'next/link'

interface CreateThreadFormProps {
  slug: string
  title: string
  setTitle: (v: string) => void
  description: string
  setDescription: (v: string) => void
  content: string
  setContent: (v: string) => void
  loading?: boolean
  error?: string
  onSubmit?: () => void
}

export function CreateThreadForm({ slug, title, setTitle, description, setDescription, content, setContent, loading, error, onSubmit }: CreateThreadFormProps) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {error && <Alert severity="error">{error}</Alert>}
      <TextField label="Thread Title" value={title} onChange={(e) => setTitle(e.target.value)} fullWidth placeholder="Enter a descriptive title for your thread..." />
      <TextField label="Description" value={description} onChange={(e) => setDescription(e.target.value)} fullWidth placeholder="Brief description of what this thread is about..." />
      <TextField label="Post Content" value={content} onChange={(e) => setContent(e.target.value)} fullWidth multiline minRows={8} maxRows={20} placeholder="Write the content of your first post..." />
      <Box sx={{ display: 'flex', gap: 2 }}>
        <Button variant="contained" endIcon={<SendOutlined />} size="large" onClick={onSubmit} disabled={loading}>
          {loading ? 'Creating...' : 'Create Thread'}
        </Button>
        <Button variant="outlined" component={Link} href={`/site/${slug}/forum`}>Cancel</Button>
      </Box>
    </Box>
  )
}
