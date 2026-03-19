'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Container, Typography, Box, Button } from '@mui/material'
import { SaveOutlined } from '@mui/icons-material'
import Link from 'next/link'
import { useArticleEditor } from '@/hooks/useArticleEditor'
import { useTenantId } from '@/hooks/useTenantId'
import { BackButton } from '@/components/common/BackButton'
import { ArticleEditorForm } from '@/components/articles/ArticleEditorForm'
import api from '@/lib/api'

export default function CreateArticlePage() {
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string
  const { tenantId } = useTenantId(slug)
  const editor = useArticleEditor()
  const [saving, setSaving] = useState(false)

  const handleCreate = () => {
    if (!editor.title.trim() || !editor.content.trim() || !tenantId) return
    setSaving(true)
    const name = editor.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
    api.post('/api/articles', {
      name,
      displayName: editor.title,
      content: editor.content,
      renderer: editor.renderer.toLowerCase(),
      tenant_id: tenantId,
    })
      .then(() => router.push(`/site/${slug}/articles/${name}`))
      .catch(() => {})
      .finally(() => setSaving(false))
  }

  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Box sx={{ mb: 4 }}>
        <BackButton href={`/site/${slug}/articles`} label="Back to Articles" />
      </Box>
      <Typography variant="h3" component="h1" gutterBottom>Create Article</Typography>
      <ArticleEditorForm editor={editor} contentPlaceholder="Write your article content here..." />
      <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
        <Button variant="contained" startIcon={<SaveOutlined />} size="large"
          onClick={handleCreate} disabled={saving || !editor.title.trim()}>
          {saving ? 'Creating...' : 'Create Article'}
        </Button>
        <Button variant="outlined" component={Link} href={`/site/${slug}/articles`}>Cancel</Button>
      </Box>
    </Container>
  )
}
