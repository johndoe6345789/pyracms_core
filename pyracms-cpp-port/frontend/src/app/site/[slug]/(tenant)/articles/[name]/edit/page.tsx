'use client'

import { useState, useEffect } from 'react'
import {
  useParams,
  useRouter,
} from 'next/navigation'
import {
  Container,
  Typography,
  Box,
  Button,
} from '@mui/material'
import { SaveOutlined } from '@mui/icons-material'
import Link from 'next/link'
import {
  useArticleEditor,
} from '@/hooks/useArticleEditor'
import {
  useTenantId,
} from '@/hooks/useTenantId'
import {
  BackButton,
} from '@/components/common/BackButton'
import {
  ArticleEditorForm,
} from '@/components/articles/ArticleEditorForm'
import api from '@/lib/api'

export default function EditArticlePage() {
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string
  const name = params.name as string
  const { tenantId } = useTenantId(slug)
  const editor = useArticleEditor()
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!tenantId) return
    const url =
      `/api/articles/${name}` +
      `?tenant_id=${tenantId}`
    api.get(url)
      .then(res => {
        const a = res.data
        editor.setTitle(
          a.displayName || ''
        )
        editor.setContent(
          a.content || ''
        )
        editor.setRenderer(
          a.rendererName || 'html'
        )
        editor.setTagsInput(
          (a.tags || []).join(', ')
        )
      })
      .catch(() => {})
  }, [name, tenantId])

  const handleSave = () => {
    if (!tenantId) return
    setSaving(true)
    api.put(`/api/articles/${name}`, {
      content: editor.content,
      summary:
        editor.summary ||
        'Updated article',
      tenant_id: tenantId,
    })
      .then(() => router.push(
        `/site/${slug}/articles/${name}`
      ))
      .catch(() => {})
      .finally(() => setSaving(false))
  }

  return (
    <Container
      maxWidth="md"
      sx={{ py: 6 }}
      data-testid="edit-article-page"
    >
      <Box sx={{ mb: 4 }}>
        <BackButton
          href={
            `/site/${slug}` +
            `/articles/${name}`
          }
          label="Back to Article"
          data-testid="back-to-article-btn"
        />
      </Box>
      <section aria-label="Edit article form">
        <Typography
          variant="h3"
          component="h1"
          gutterBottom
        >
          Edit Article
        </Typography>
        <ArticleEditorForm
          editor={editor}
        />
        <Box
          sx={{
            display: 'flex',
            gap: 2,
            mt: 3,
          }}
        >
          <Button
            variant="contained"
            startIcon={<SaveOutlined />}
            size="large"
            onClick={handleSave}
            disabled={saving}
            data-testid="save-article-btn"
          >
            {saving
              ? 'Saving...'
              : 'Save Changes'}
          </Button>
          <Button
            variant="outlined"
            component={Link}
            href={
              `/site/${slug}` +
              `/articles/${name}`
            }
            data-testid="cancel-edit-btn"
          >
            Cancel
          </Button>
        </Box>
      </section>
    </Container>
  )
}
