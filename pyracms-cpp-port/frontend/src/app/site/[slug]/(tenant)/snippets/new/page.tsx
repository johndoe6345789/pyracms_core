'use client'

import { useParams, useRouter } from 'next/navigation'
import { Container, Typography, Box } from '@mui/material'
import { BackButton } from '@/components/common/BackButton'
import { SnippetEditorForm } from '@/components/code/SnippetEditorForm'
import { useSnippetEditor } from '@/hooks/useSnippetEditor'
import { useTenantId } from '@/hooks/useTenantId'

export default function NewSnippetPage() {
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string
  const base = `/site/${slug}/snippets`
  const { tenantId } = useTenantId(slug)
  const editor = useSnippetEditor(tenantId)

  return (
    <Container
      maxWidth="lg"
      sx={{ py: 6 }}
      data-testid="new-snippet-page"
    >
      <Box sx={{ mb: 2 }}>
        <BackButton href={base} label="Back to Snippets" />
      </Box>
      <Typography variant="h3" component="h1" gutterBottom>
        New Code Snippet
      </Typography>
      <SnippetEditorForm
        editor={editor}
        saveLabel="Save Snippet"
        onSaved={(id) => router.push(`${base}/${id}`)}
        onCancel={() => router.push(base)}
      />
    </Container>
  )
}
