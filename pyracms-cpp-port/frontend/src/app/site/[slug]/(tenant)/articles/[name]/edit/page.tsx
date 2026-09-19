'use client'

import { useParams } from 'next/navigation'
import { Container, Typography, Box, Button, Alert } from '@mui/material'
import { SaveOutlined } from '@mui/icons-material'
import Link from 'next/link'
import { useTenantId } from '@/hooks/useTenantId'
import { BackButton } from '@/components/common/BackButton'
import { ArticleEditorForm } from '@/components/articles/ArticleEditorForm'
import { useEditArticle } from './useEditArticle'

export default function EditArticlePage() {
  const params = useParams()
  const slug = params.slug as string
  const name = params.name as string
  const { tenantId } = useTenantId(slug)
  const { editor, saving, error, save, markSummaryEdited } = useEditArticle(
    slug,
    name,
    tenantId,
  )
  const back = `/site/${slug}/articles/${name}`

  return (
    <Container maxWidth="md" sx={{ py: 6 }} data-testid="edit-article-page">
      <Box sx={{ mb: 4 }}>
        <BackButton
          href={back}
          label="Back to Article"
          data-testid="back-to-article-btn"
        />
      </Box>
      <section aria-label="Edit article form">
        <Typography variant="h3" component="h1" gutterBottom>
          Edit Article
        </Typography>
        {error && (
          <Alert severity="error" data-testid="edit-article-error">
            {error}
          </Alert>
        )}
        <ArticleEditorForm
          editor={editor}
          onSummaryChange={markSummaryEdited}
        />
        <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
          <Button
            variant="contained"
            startIcon={<SaveOutlined />}
            size="large"
            onClick={save}
            disabled={saving}
            data-testid="save-article-btn"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
          <Button
            variant="outlined"
            component={Link}
            href={back}
            data-testid="cancel-edit-btn"
          >
            Cancel
          </Button>
        </Box>
      </section>
    </Container>
  )
}
